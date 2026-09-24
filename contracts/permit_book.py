# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
import re
from genlayer import *


class PermitBook(gl.Contract):
    owner_address: str
    engine_address: str
    engine_bound: bool
    permits: TreeMap[str, str]
    permit_keys: DynArray[str]

    def __init__(self):
        self.owner_address = gl.message.sender_address.as_hex
        self.engine_address = ""
        self.engine_bound = False

    def _require_key(self, value: str, label: str) -> None:
        if not re.fullmatch(r"[A-Za-z0-9._:-]{4,96}", value):
            raise gl.vm.UserError(f"invalid {label}")

    @gl.public.write
    def bind_engine(self, engine_address: str) -> str:
        if gl.message.sender_address.as_hex != self.owner_address:
            raise gl.vm.UserError("only deployer may bind engine")
        if self.engine_bound:
            raise gl.vm.UserError("engine already bound")

        normalized = (
            engine_address.as_hex
            if hasattr(engine_address, "as_hex")
            else Address(engine_address).as_hex
        )
        self.engine_address = normalized
        self.engine_bound = True
        return normalized

    @gl.public.write
    def issue_permit(
        self,
        permit_key: str,
        intent_key: str,
        licence_key: str,
        holder: str,
        decision_json: str,
    ) -> str:
        if not self.engine_bound:
            raise gl.vm.UserError("permission engine not bound")
        if gl.message.sender_address.as_hex != self.engine_address:
            raise gl.vm.UserError("unauthorised issuer")

        self._require_key(permit_key, "permit key")
        self._require_key(intent_key, "intent key")
        self._require_key(licence_key, "licence key")

        if permit_key in self.permits:
            raise gl.vm.UserError("permit already exists")

        try:
            decision = json.loads(decision_json)
        except Exception:
            raise gl.vm.UserError("invalid decision JSON")

        outcome = str(decision.get("outcome", ""))
        if outcome not in ("PERMITTED", "PERMITTED_WITH_CONDITIONS"):
            raise gl.vm.UserError("only permission outcomes may issue a permit")

        conditions = decision.get("conditions", [])
        if not isinstance(conditions, list) or len(conditions) > 8:
            raise gl.vm.UserError("invalid permit conditions")

        record = {
            "permit_key": permit_key,
            "intent_key": intent_key,
            "licence_key": licence_key,
            "holder": Address(holder).as_hex,
            "outcome": outcome,
            "conditions": conditions,
            "summary": str(decision.get("summary", ""))[:1200],
            "material_clauses": decision.get("material_clauses", [])[:8],
            "terms_digest": str(decision.get("terms_digest", "")),
            "intent_digest": str(decision.get("intent_digest", "")),
            "issuer": self.engine_address,
            "finalized_only": True,
        }

        self.permits[permit_key] = json.dumps(record, sort_keys=True)
        self.permit_keys.append(permit_key)
        return permit_key

    @gl.public.view
    def has_permit(self, permit_key: str) -> bool:
        return permit_key in self.permits

    @gl.public.view
    def get_permit_json(self, permit_key: str) -> str:
        return self.permits.get(permit_key, "")

    @gl.public.view
    def list_permit_keys(self) -> list:
        return [self.permit_keys[i] for i in range(len(self.permit_keys))]
