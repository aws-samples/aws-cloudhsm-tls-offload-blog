FROM public.ecr.aws/amazonlinux/amazonlinux:2.0.20201111.0 
USER root 
RUN amazon-linux-extras install nginx1 -y 
RUN curl -L https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL7/cloudhsm-dyn-latest.el7.x86_64.rpm -o cloudhsm.rpm && yum install ./cloudhsm.rpm -y 
RUN ln -sf /opt/cloudhsm/lib/libcloudhsm_openssl_engine.so /usr/lib64/engines-1.1/cloudhsm.so
RUN mkdir -p /etc/pki/nginx/private 
COPY ./nginx.conf /etc/nginx/ 
COPY ./index.html /usr/share/nginx/html 
COPY ./nginx.service /lib/systemd/system/ 
COPY ./dhparam.pem /etc/ssl/certs/ 
COPY ./run.sh /usr/local/bin/ 
RUN chmod +x /usr/local/bin/run.sh 
ENTRYPOINT ["/usr/local/bin/run.sh"] 
STOPSIGNAL SIGQUIT 
CMD ["nginx", "-g", "daemon off;"]