version: '3'

services:

  selezioni:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
      GATEWAY_HOST: "cool-jconon.test.si.cnr.it"
      GATEWAY_PORT: "80"
    network_mode: bridge
    tmpfs:
    - /tmp/

  nginx:
    image: nginx:1.13-alpine
    network_mode: bridge
    environment:
    - 'FASTCGI_READ_TIMEOUT=300s'
    links:
    - selezioni:selezioni
    labels:
      SERVICE_NAME: ##{SERVICE_NAME}##
    read_only: true
    volumes:
    - ./conf.d/:/etc/nginx/conf.d/
    - /var/cache/nginx/
    - /var/run/
