import argparse
import json
import math
import os
from collections import Counter, defaultdict
from pathlib import Path
from urllib import error, parse, request

import pandas as pd


EXCEL_PATH = Path(r"C:\Users\julia\Downloads\IVA.xlsx")
ENV_PATH = Path(".env.local")

MONTHS = {
    "OCTUBRE": (2025, "10", "Octubre"),
    "NOVIEMBRE": (2025, "11", "Noviembre"),
    "DICIEMBRE": (2025, "12", "Diciembre"),
    "ENERO": (2026, "01", "Enero"),
    "FEBRERO": (2026, "02", "Febrero"),
    "MRZO": (2026, "03", "Marzo"),
    "MARZO": (2026, "03", "Marzo"),
    "ABRIL": (2026, "04", "Abril"),
}

COLUMNS = {
    "ENTRADA": ("Entrada", "ENTRADA"),
    "SALIDA": ("Salida", "SALIDA"),
}

EXCLUDED_HISTORICAL_CATEGORIES = {
    "FACTURACION",
    "COMPRAS",
}


def load_env() -> dict[str, str]:
    values = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value.strip().strip('"').strip("'")
    return values


def supabase_request(
    env: dict[str, str],
    method: str,
    path: str,
    body: list[dict] | None = None,
) -> object:
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + path
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = request.Request(url, data=data, method=method)
    req.add_header("apikey", env["NEXT_PUBLIC_SUPABASE_ANON_KEY"])
    req.add_header("Authorization", f"Bearer {env['NEXT_PUBLIC_SUPABASE_ANON_KEY']}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")

    if method in {"POST", "DELETE"}:
        req.add_header("Prefer", "return=representation")

    try:
        with request.urlopen(req, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase {method} {path} failed: {exc.code} {details}") from exc

    return json.loads(raw) if raw else []


def supabase_delete_ids(env: dict[str, str], ids: list[int]) -> object:
    quoted_ids = ",".join(str(item) for item in ids)
    query = parse.urlencode(
        {
            "id": f"in.({quoted_ids})",
            "select": "id,tipo,categoria,descripcion,monto,fecha",
        },
        safe="(),.",
    )
    return supabase_request(
        env,
        "DELETE",
        f"/rest/v1/movimientos_financieros?{query}",
    )


def normalize_amount(value: object) -> int | float | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None

    amount = float(value)
    if amount <= 0:
        return None

    return int(amount) if amount.is_integer() else amount


def is_summary_row(series: pd.Series, row_index: int, amount: int | float) -> bool:
    previous_values = [
        normalize_amount(value)
        for value in series.iloc[:row_index]
    ]
    previous_total = sum(value for value in previous_values if value is not None)

    return previous_total > 0 and math.isclose(float(amount), float(previous_total), abs_tol=0.01)


def find_month_summary_row(sheet: pd.DataFrame) -> int | None:
    entrada_column = next(
        (column for column in sheet.columns if str(column).strip().upper() == "ENTRADA"),
        None,
    )
    salida_column = next(
        (column for column in sheet.columns if str(column).strip().upper() == "SALIDA"),
        None,
    )
    control_columns = [
        column
        for column in sheet.columns
        if str(column).strip().upper() in {"COLUMNA 3", "UNNAMED: 6"}
    ]

    for column in control_columns:
        non_empty = sheet[column].dropna()
        if not non_empty.empty:
            return int(non_empty.index[-1])

    if entrada_column is None and salida_column is None:
        return None

    candidates = []
    for index, row in sheet.iterrows():
        entrada = normalize_amount(row[entrada_column]) if entrada_column is not None else None
        salida = normalize_amount(row[salida_column]) if salida_column is not None else None

        if entrada is not None and salida is not None:
            candidates.append(int(index))

    return candidates[-1] if candidates else None


def build_records() -> list[dict]:
    records = []
    workbook = pd.ExcelFile(EXCEL_PATH)

    for sheet_name in workbook.sheet_names:
        sheet_key = sheet_name.strip().upper()
        if sheet_key not in MONTHS:
            continue

        year, month, month_label = MONTHS[sheet_key]
        date = f"{year}-{month}-01"
        sheet = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        summary_row = find_month_summary_row(sheet)

        if summary_row is None:
            continue

        for column in sheet.columns:
            column_key = str(column).strip().upper()
            if column_key not in COLUMNS:
                continue

            movement_type, category = COLUMNS[column_key]
            description = f"{category} {month_label} {year}"
            amount = normalize_amount(sheet.at[summary_row, column])
            if amount is None:
                continue

            records.append(
                {
                    "tipo": movement_type,
                    "categoria": category,
                    "descripcion": description,
                    "monto": amount,
                    "fecha": date,
                }
            )

    return records


def build_detail_records() -> list[dict]:
    records = []
    workbook = pd.ExcelFile(EXCEL_PATH)

    for sheet_name in workbook.sheet_names:
        sheet_key = sheet_name.strip().upper()
        if sheet_key not in MONTHS:
            continue

        year, month, month_label = MONTHS[sheet_key]
        date = f"{year}-{month}-01"
        sheet = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        summary_row = find_month_summary_row(sheet)

        for column in sheet.columns:
            column_key = str(column).strip().upper()
            if column_key not in COLUMNS:
                continue

            movement_type, category = COLUMNS[column_key]
            description = f"{category} {month_label} {year}"

            for row_index, value in enumerate(sheet[column]):
                if row_index == summary_row:
                    continue

                amount = normalize_amount(value)
                if amount is None:
                    continue

                records.append(
                    {
                        "tipo": movement_type,
                        "categoria": category,
                        "descripcion": description,
                        "monto": amount,
                        "fecha": date,
                    }
                )

    return records


def excluded_descriptions() -> set[tuple[str, str, str]]:
    descriptions = set()

    for year, month, month_label in MONTHS.values():
        date = f"{year}-{month}-01"
        descriptions.add(("FACTURACION", f"FACTURACION {month_label} {year}", date))
        descriptions.add(("COMPRAS", f"COMPRAS {month_label} {year}", date))

    return descriptions


def movement_key(record: dict) -> tuple:
    return (
        record["tipo"],
        record["categoria"],
        record["descripcion"],
        float(record["monto"]),
        record["fecha"],
    )


def summary_key(record: dict) -> str:
    return f"{record['fecha'][:7]} | {record['categoria']} | {record['tipo']}"


def summarize(records: list[dict]) -> dict[str, dict[str, float]]:
    summary: dict[str, dict[str, float]] = defaultdict(lambda: {"count": 0, "total": 0})
    for record in records:
        key = summary_key(record)
        summary[key]["count"] += 1
        summary[key]["total"] += float(record["monto"])
    return dict(sorted(summary.items()))


def get_existing_movements(env: dict[str, str]) -> list[dict]:
    records = []
    page_size = 1000
    offset = 0

    while True:
        query = parse.urlencode(
            {
                "select": "id,tipo,categoria,descripcion,monto,fecha",
                "order": "id.asc",
                "limit": str(page_size),
                "offset": str(offset),
            }
        )
        page = supabase_request(env, "GET", f"/rest/v1/movimientos_financieros?{query}")
        records.extend(page)

        if len(page) < page_size:
            return records

        offset += page_size


def get_missing_records(generated: list[dict], existing: list[dict]) -> tuple[list[dict], list[dict]]:
    existing_counts = Counter(movement_key(record) for record in existing)
    missing = []
    skipped = []

    for record in generated:
        key = movement_key(record)
        if existing_counts[key] > 0:
            existing_counts[key] -= 1
            skipped.append(record)
        else:
            missing.append(record)

    return missing, skipped


def get_cleanup_records(existing: list[dict]) -> list[dict]:
    removable = excluded_descriptions()

    return [
        record
        for record in existing
        if (
            record["categoria"],
            record["descripcion"],
            record["fecha"],
        )
        in removable
    ]


def get_summary_cleanup_records(existing: list[dict]) -> list[dict]:
    summary_counts = Counter(movement_key(record) for record in build_detail_records())
    cleanup = []

    for record in existing:
        key = movement_key(record)
        if summary_counts[key] <= 0:
            continue

        cleanup.append(record)
        summary_counts[key] -= 1

    return cleanup


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import missing IVA historical movements into Supabase."
    )
    parser.add_argument("--apply", action="store_true", help="Insert missing rows.")
    parser.add_argument(
        "--cleanup-extra-preview",
        action="store_true",
        help="Preview historical FACTURACION/COMPRAS rows that should be removed.",
    )
    parser.add_argument(
        "--cleanup-extra-apply",
        action="store_true",
        help="Delete historical FACTURACION/COMPRAS rows generated from IVA.xlsx.",
    )
    parser.add_argument(
        "--cleanup-summary-preview",
        action="store_true",
        help="Preview ENTRADA/SALIDA monthly summary rows that should be removed.",
    )
    parser.add_argument(
        "--cleanup-summary-apply",
        action="store_true",
        help="Delete ENTRADA/SALIDA monthly summary rows generated from IVA.xlsx.",
    )
    args = parser.parse_args()

    if not EXCEL_PATH.exists():
        raise FileNotFoundError(EXCEL_PATH)

    env = load_env()
    generated = build_records()
    existing = get_existing_movements(env)

    if args.cleanup_extra_preview or args.cleanup_extra_apply:
        cleanup_records = get_cleanup_records(existing)
        report = {
            "mode": "cleanup-extra-apply"
            if args.cleanup_extra_apply
            else "cleanup-extra-preview",
            "existing_in_supabase": len(existing),
            "rows_to_delete": len(cleanup_records),
            "delete_by_month_category": summarize(cleanup_records),
        }

        print(json.dumps(report, ensure_ascii=False, indent=2))

        if args.cleanup_extra_apply and cleanup_records:
            batch_size = 500
            cleanup_ids = [record["id"] for record in cleanup_records]
            for index in range(0, len(cleanup_ids), batch_size):
                supabase_delete_ids(env, cleanup_ids[index : index + batch_size])

            print(
                json.dumps(
                    {
                        "delete_requested": len(cleanup_ids),
                        "final_expected_total": len(existing) - len(cleanup_ids),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )

        return

    if args.cleanup_summary_preview or args.cleanup_summary_apply:
        cleanup_records = get_summary_cleanup_records(existing)
        report = {
            "mode": "cleanup-summary-apply"
            if args.cleanup_summary_apply
            else "cleanup-summary-preview",
            "existing_in_supabase": len(existing),
            "rows_to_delete": len(cleanup_records),
            "delete_by_month_category": summarize(cleanup_records),
        }

        print(json.dumps(report, ensure_ascii=False, indent=2))

        if args.cleanup_summary_apply and cleanup_records:
            batch_size = 500
            cleanup_ids = [record["id"] for record in cleanup_records]
            for index in range(0, len(cleanup_ids), batch_size):
                supabase_delete_ids(env, cleanup_ids[index : index + batch_size])

            print(
                json.dumps(
                    {
                        "delete_requested": len(cleanup_ids),
                        "final_expected_total": len(existing) - len(cleanup_ids),
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )

        return

    missing, skipped = get_missing_records(generated, existing)

    report = {
        "mode": "apply" if args.apply else "preview",
        "generated_from_excel": len(generated),
        "existing_in_supabase": len(existing),
        "already_existing_skipped": len(skipped),
        "missing_to_insert": len(missing),
        "missing_by_month_category": summarize(missing),
        "skipped_by_month_category": summarize(skipped),
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if not args.apply or not missing:
        return

    inserted = []
    batch_size = 500
    for index in range(0, len(missing), batch_size):
        batch = missing[index : index + batch_size]
        inserted.extend(
            supabase_request(env, "POST", "/rest/v1/movimientos_financieros", batch)
        )

    print(
        json.dumps(
            {
                "inserted": len(inserted),
                "final_expected_total": len(existing) + len(inserted),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
