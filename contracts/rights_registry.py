# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import hashlib
import json
import re
from genlayer import *


class RightsRegistry(gl.Contract):
    licences: TreeMap[str, str]
    licence_keys: DynArray[str]

    def __init__(self):
        pass

    def _require_key(self, value: str, label: str) -> None:
        if not re.fullmatch(r"[A-Za-z0-9._:-]{4,64}", value):
            raise gl.vm.UserError(f"invalid {label}")

    def _require_text(self, value: str, minimum: int, maximum: int, label: str) -> None:
        if len(value.strip()) < minimum or len(value) > maximum:
            raise gl.vm.UserError(f"invalid {label} length")

    def _canonical_digest(self, payload: dict) -> str:
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(encoded.encode("utf-8")).hexdigest()

    @gl.public.write
    def register_licence(
        self,
        licence_key: str,
        title: str,
        asset_type: str,
        canonical_source: str,
        rights_holder: str,
        terms_text: str,
        rights_map_json: str,
    ) -> str:
        self._require_key(licence_key, "licence key")
        if licence_key in self.licences:
            raise gl.vm.UserError("licence key already exists")

        self._require_text(title, 3, 140, "title")
        self._require_text(asset_type, 2, 48, "asset type")
        self._require_text(rights_holder, 2, 140, "rights holder")
        self._require_text(terms_text, 80, 12000, "terms")

        if len(canonical_source) > 512 or not (
            canonical_source.startswith("https://") or canonical_source.startswith("ipfs://")
        ):
            raise gl.vm.UserError("canonical source must use https:// or ipfs://")

        if len(rights_map_json) > 6000:
            raise gl.vm.UserError("rights map is too large")

        try:
            rights_map = json.loads(rights_map_json)
        except Exception:
            raise gl.vm.UserError("rights map must be valid JSON")

        if not isinstance(rights_map, dict) or len(rights_map) == 0:
            raise gl.vm.UserError("rights map must be a non-empty object")

        frozen_core = {
            "licence_key": licence_key,
            "title": title.strip(),
            "asset_type": asset_type.strip(),
            "canonical_source": canonical_source.strip(),
            "rights_holder": rights_holder.strip(),
            "terms_text": terms_text.strip(),
            "rights_map": rights_map,
        }
        digest = self._canonical_digest(frozen_core)

        record = dict(frozen_core)
        record["terms_digest"] = digest
        record["registrant"] = gl.message.sender_address.as_hex
        record["registered_at"] = str(gl.message.datetime)
        record["frozen"] = True

        self.licences[licence_key] = json.dumps(record, sort_keys=True)
        self.licence_keys.append(licence_key)
        return licence_key

    @gl.public.view
    def licence_exists(self, licence_key: str) -> bool:
        return licence_key in self.licences

    @gl.public.view
    def get_licence_json(self, licence_key: str) -> str:
        return self.licences.get(licence_key, "")

    @gl.public.view
    def list_licence_keys(self) -> list:
        return [self.licence_keys[i] for i in range(len(self.licence_keys))]
