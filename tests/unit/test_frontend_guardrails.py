from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"


def test_only_agreed_page_routes_exist():
    pages = sorted(
        path.relative_to(FRONTEND / "app").as_posix()
        for path in (FRONTEND / "app").rglob("page.tsx")
    )
    assert pages == [
        "intent/[intentKey]/page.tsx",
        "page.tsx",
        "permit/[permitKey]/page.tsx",
        "registry/page.tsx",
        "terms/[licenceKey]/page.tsx",
    ]


def test_banned_generic_route_names_are_absent():
    banned = {"dashboard", "account", "settings", "protocol", "evidence", "consensus", "reviews", "open", "new"}
    route_parts = {part.lower() for path in (FRONTEND / "app").rglob("*") for part in path.parts}
    assert not (banned & route_parts)


def test_old_generic_shell_component_names_are_absent():
    names = {path.name.lower() for path in FRONTEND.rglob("*.tsx")}
    for banned in ("header.tsx", "footer.tsx", "walletbutton.tsx", "txnotice.tsx", "sidebar.tsx", "dashboard.tsx"):
        assert banned not in names


def test_usebond_palette_is_present():
    css = (FRONTEND / "app" / "globals.css").read_text().lower()
    for colour in ("#f3ebdd", "#221c18", "#7b2d3b", "#5b6744", "#b77a32"):
        assert colour in css


def test_no_walletconnect_or_snap_dependency():
    package = (FRONTEND / "package.json").read_text().lower()
    assert "walletconnect" not in package
    assert "snap" not in package


def test_permission_passport_requires_finality_verification():
    source = (FRONTEND / "permit-book" / "PermitPassport.tsx").read_text()
    assert 'observation.stage === "FINALIZED"' in source
    assert "findFinalizedPermitTransaction" in source
