

# ARG NODE_VERSION=14.17.6
# FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine

FROM --platform=linux/amd64 ubuntu:18.04

# install nodejs
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs

# install git
RUN apt install -y git

# install brew
RUN apt-get install -y build-essential
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# install opencv
RUN brew install pkg-config
RUN brew install opencv@3
RUN brew link --force opencv@3

WORKDIR /app

COPY package.json ./

RUN npm install


COPY . ./


ENV SOCKET_PORT=4001

CMD ["npm", "start" ]
