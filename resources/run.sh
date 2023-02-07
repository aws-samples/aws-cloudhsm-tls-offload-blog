#!/bin/sh
echo "Adding PEM and Certs"
printf "%s" "$FAKE_PEM" > /etc/pki/nginx/private/server.key
cat /etc/pki/nginx/private/server.key
printf "%s" "$SERVER_CERT" > /etc/pki/nginx/server.crt
cat /etc/pki/nginx/server.crt
printf "%s" "$CLUSTER_CERT" > /opt/cloudhsm/etc/customerCA.crt
cat /opt/cloudhsm/etc/customerCA.crt
echo "Modifying permissions"
chown nginx /etc/pki/nginx/server.crt /etc/pki/nginx/private/server.key
echo "Configuring HSM client"
/opt/cloudhsm/bin/configure-dyn --hsm-ca-cert /opt/cloudhsm/etc/customerCA.crt
/opt/cloudhsm/bin/configure-dyn --cluster-id $CLUSTER_ID --region $AWS_DEFAULT_REGION
/opt/cloudhsm/bin/configure-dyn --log-level info
echo "run config complete"
exec "$@"