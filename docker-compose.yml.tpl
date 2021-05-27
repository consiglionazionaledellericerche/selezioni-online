version: '3'

services:

  selezioni:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
      GATEWAY_HOST: "cool-jconon.si.cnr.it"
      GATEWAY_PORT: "80"
    network_mode: bridge
    labels:
      SERVICE_NAME: ##{SERVICE_NAME}##
      PUBLIC_NAME: selezioni-online.si.cnr.it
    extra_hosts:
      - "cool-jconon.test.si.cnr.it:150.146.206.186"
    tmpfs:
    - /tmp/
