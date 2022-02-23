
#Make sure you point the ECR Image correctly
FROM <YourAccountNo>.dkr.ecr.us-east-1.amazonaws.com/catalogapp:node14

# Create app directory
WORKDIR /usr/src/app


# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json package-lock.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]