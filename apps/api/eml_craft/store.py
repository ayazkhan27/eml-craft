from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterable
from pathlib import Path

from . import engine
from .catalog import GOALS, STARTER_KEYS
from .schemas import Goal, Item, Recipe


def default_db_path() -> Path:
    configured = os.environ.get("EML_CRAFT_DB")
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[1] / ".data" / "eml-craft.sqlite3"


class Store:
    def __init__(self, db_path: Path | None = None) -> None:
        self.db_path = db_path or default_db_path()

    def connect(self) -> sqlite3.Connection:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                create table if not exists items (
                  id text primary key,
                  label text not null,
                  expression text not null,
                  eml_tree text not null,
                  depth integer not null,
                  known integer not null,
                  known_key text,
                  created_at text not null default current_timestamp
                );

                create table if not exists recipes (
                  id text primary key,
                  left_id text not null,
                  right_id text not null,
                  result_id text not null,
                  created_at text not null default current_timestamp,
                  unique(left_id, right_id)
                );

                create table if not exists goals (
                  id text primary key,
                  label text not null,
                  target_key text not null,
                  completed_item_id text
                );
                """
            )
            self._seed_items(conn, (engine.seed_item(key) for key in STARTER_KEYS))
            self._seed_goals(conn)

    def _seed_items(self, conn: sqlite3.Connection, items: Iterable[engine.EngineItem]) -> None:
        for item in items:
            conn.execute(
                """
                insert or ignore into items
                  (id, label, expression, eml_tree, depth, known, known_key)
                values (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item.id,
                    item.label,
                    item.expression,
                    item.eml_tree,
                    item.depth,
                    int(item.known),
                    item.known_key,
                ),
            )

    def _seed_goals(self, conn: sqlite3.Connection) -> None:
        for goal_id, label, target_key in GOALS:
            conn.execute(
                """
                insert or ignore into goals (id, label, target_key)
                values (?, ?, ?)
                """,
                (goal_id, label, target_key),
            )

    def list_items(self) -> list[Item]:
        with self.connect() as conn:
            rows = conn.execute(
                "select * from items order by datetime(created_at), label"
            ).fetchall()
        return [self._item_from_row(row) for row in rows]

    def list_recipes(self) -> list[Recipe]:
        with self.connect() as conn:
            rows = conn.execute("select * from recipes order by datetime(created_at)").fetchall()
        return [self._recipe_from_row(row) for row in rows]

    def list_goals(self) -> list[Goal]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                select id, label, target_key, completed_item_id,
                  completed_item_id is not null as completed
                from goals
                order by rowid
                """
            ).fetchall()
        return [self._goal_from_row(row) for row in rows]

    def get_item(self, item_id: str) -> Item | None:
        with self.connect() as conn:
            row = conn.execute("select * from items where id = ?", (item_id,)).fetchone()
        return self._item_from_row(row) if row else None

    def get_recipe(self, left_id: str, right_id: str) -> Recipe | None:
        with self.connect() as conn:
            row = conn.execute(
                "select * from recipes where left_id = ? and right_id = ?",
                (left_id, right_id),
            ).fetchone()
        return self._recipe_from_row(row) if row else None

    def upsert_item(self, item: engine.EngineItem) -> Item:
        with self.connect() as conn:
            conn.execute(
                """
                insert or ignore into items
                  (id, label, expression, eml_tree, depth, known, known_key)
                values (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item.id,
                    item.label,
                    item.expression,
                    item.eml_tree,
                    item.depth,
                    int(item.known),
                    item.known_key,
                ),
            )
            self._complete_matching_goals(conn, item)
            row = conn.execute("select * from items where id = ?", (item.id,)).fetchone()
        return self._item_from_row(row)

    def create_recipe(self, left_id: str, right_id: str, result_id: str) -> Recipe:
        recipe_id = engine.recipe_id_for(left_id, right_id)
        with self.connect() as conn:
            conn.execute(
                """
                insert or ignore into recipes (id, left_id, right_id, result_id)
                values (?, ?, ?, ?)
                """,
                (recipe_id, left_id, right_id, result_id),
            )
            row = conn.execute("select * from recipes where id = ?", (recipe_id,)).fetchone()
        return self._recipe_from_row(row)

    def _complete_matching_goals(
        self, conn: sqlite3.Connection, item: engine.EngineItem
    ) -> None:
        if not item.known_key:
            return
        conn.execute(
            """
            update goals
            set completed_item_id = coalesce(completed_item_id, ?)
            where target_key = ?
            """,
            (item.id, item.known_key),
        )

    @staticmethod
    def _item_from_row(row: sqlite3.Row) -> Item:
        return Item(
            id=row["id"],
            label=row["label"],
            expression=row["expression"],
            eml_tree=row["eml_tree"],
            depth=row["depth"],
            known=bool(row["known"]),
            known_key=row["known_key"],
            created_at=row["created_at"],
        )

    @staticmethod
    def _recipe_from_row(row: sqlite3.Row) -> Recipe:
        return Recipe(
            id=row["id"],
            left_id=row["left_id"],
            right_id=row["right_id"],
            result_id=row["result_id"],
            created_at=row["created_at"],
        )

    @staticmethod
    def _goal_from_row(row: sqlite3.Row) -> Goal:
        return Goal(
            id=row["id"],
            label=row["label"],
            target_key=row["target_key"],
            completed=bool(row["completed"]),
            completed_item_id=row["completed_item_id"],
        )
