#!/usr/bin/env bash
# Apacheで公開するスクリプト (Debian/Ubuntu, 要root: sudo ./deploy.sh)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/site" && pwd)"
DEST=/var/www/train-guide

apt-get update
apt-get install -y apache2
a2enmod headers >/dev/null

install -d -m 0755 "$DEST"
install -m 0644 "$SRC"/index.html "$SRC"/stations.js "$SRC"/app.js "$SRC"/style.css "$SRC"/ogp.png "$DEST"/

cat > /etc/apache2/conf-available/train-guide.conf <<'CONF'
ServerTokens Prod
ServerSignature Off
TraceEnable Off
Alias /train-guide /var/www/train-guide
<Directory /var/www/train-guide>
    Options None
    AllowOverride None
    Require all granted
    <FilesMatch "^\.">
        Require all denied
    </FilesMatch>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Referrer-Policy "no-referrer"
    Header always set Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
</Directory>
CONF
a2enconf train-guide
apache2ctl configtest
systemctl enable --now apache2
systemctl reload apache2
echo "公開完了: http://localhost/train-guide/"
