# Deployed source provenance

## Scope

This report compares the repository source with the three canonical GenLayer Studionet deployments on chain ID **61999**. No contract was redeployed and no contract or validator logic was changed during this verification.

The reproducible check is the GitHub Actions `source-provenance` job in `.github/workflows/ci.yml`. It first confirms each deployment transaction is `FINALIZED`, retrieves contract source from Studionet, computes SHA-256, and compares it with the checked-out file. A source-content mismatch fails CI. A CRLF/LF-only difference is reported explicitly and is not described as a byte-for-byte match.

## Results

| Contract | Canonical address | Deployment transaction | Deployed SHA-256 | Repository SHA-256 | Result |
| --- | --- | --- | --- | --- | --- |
| RightsRegistry | `0x8D266231904d5eA14BEe00298A09BeC971572B2A` | `0xf55ece2d712186155d8c6ee853992a1032ece3ba3146ad392d5db9d24328af21` | `c331eaccf0e986e990cbb3a7a53aa8839063589c7bb9e3c96b2d3d61c1659b46` | same | **Exact byte match** |
| PermissionEngine | `0x88C1b897759E57dD3f24c42ed26248FaE6F610A7` | `0x3c85db1b81f24874ea21f65736047d6a71f24330bd8c34294203c05661b10429` | `b26bbca8de05bf531ece5f655a43563ac3f474600022e1a018f02a2f24047604` | `689ae2dca081ae08a6811914c8e90d219c150c46792fed31c06c4bc13b6fe573` | **Not byte-identical; EOL-normalized content matches exactly** |
| PermitBook | `0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676` | `0x57e309bc5f5b7805614f608af40fbdb1d313fe0543f625c8842518d49b862c15` | `941c520d050de3d65463b90c5148a268d016da25e58747aac12a5051ad6558d2` | same | **Exact byte match** |

All three deployment transactions were observed as `FINALIZED`.

### PermissionEngine line-ending result

The deployed PermissionEngine source is **15,462 bytes**; the GitHub Actions checkout is **15,163 bytes**. The raw hashes therefore differ. After converting CRLF and LF to a common LF representation, the contents are identical. This proves the difference is line-ending representation only, not contract logic or validator logic. The deployed CRLF hash also matches the previously archived source-manifest hash `b26bbca8...`.

Because there is no source-content mismatch, redeployment is neither required nor justified by this provenance check.

### PermitBook lookup casing

Studionet's legacy `gen_getContractCode` lookup returned "Contract ... not found" for the display-cased form `0xA7Ca...310C60...`, but returned the deployed source for the deployment-manifest form `0xA7Ca...310c60...`. The hexadecimal address value is the same; only letter casing differs. The returned source then matched `contracts/permit_book.py` byte-for-byte.

The handoff documents use the requested canonical display form consistently. CI retains the manifest-cased lookup as a compatibility fallback for the current Studionet RPC behavior.

## GenVM validation relationship

Source provenance is separate from GenVM validation. The Ubuntu contract-evidence job also runs both `genvm-lint check` and `genvm-lint validate` against all three repository contracts, and all three pass. This report does not use the live lifecycle as a substitute for source verification; both forms of evidence are retained independently.
