FROM debian:jessie

WORKDIR /root
RUN apt-get update && apt-get install -y xvfb chromium bash nodejs npm transifex-client git
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g bower grunt-cli

ADD xvfb-chromium /usr/bin/xvfb-chromium
RUN ln -s /usr/bin/xvfb-chromium /usr/bin/google-chrome
RUN ln -s /usr/bin/xvfb-chromium /usr/bin/chromium-browser

WORKDIR /app
VOLUME ["/app"]

EXPOSE 9000
CMD npm install --no-optional && bower install --allow-root --config.interactive=false && bash
