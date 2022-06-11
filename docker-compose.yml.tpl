version: '3'

services:

  selezioni:
    image: docker.si.cnr.it/##{CONTAINER_ID}##
    environment:
      API_URL: "http://cool-jconon.si.cnr.it"
      OIDC_ENABLE: "false"
    network_mode: bridge
    labels:
      SERVICE_NAME: ##{SERVICE_NAME}##
      PUBLIC_NAME: selezioni-online.si.cnr.it
    extra_hosts:
      - "cool-jconon.test.si.cnr.it:150.146.206.186"
    tmpfs:
    - /tmp/
