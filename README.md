# MedGemma
MedGemma — Advanced AI Models for Medical Text and Images.

# Installation with Ubuntu Server

# Step 1: Update and Install Dependencies on Ubuntu Server 20.04

```bash

apt update & apt uggrade -y

```

```bash

apt install git -y

```

# Step 2: Download Ollama

```bash

curl -fsSL https://ollama.com/install.sh | sh

```

# Step 3: Start Ollama:

```bash

ollama serve &

```

# Step 4: Testing the API in the browser:
```bash

http://localhost:11434/

```

# Step 5: Download image amsaravi/medgemma-4b-it:q8:

```bash

ollama pull amsaravi/medgemma-4b-it:q8

```

# Check the API template.

```bash

http://localhost:11434/api/tags

```

# Step 6:  Download and run the configuration script for Node.js 20.x

```bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

```

# Step 4: Install Node.js and npm

```bash
sudo apt install -y nodejs

```
# Step 5: Verify the installation

```bash
node -v
npm -v

```

# Step 6: PM2 Global Installation

```bash

npm install -g pm2

```


# Step 7: Clone the repository from Github

```bash

git clone https://github.com/pablowilliam/MedGemma.git

```

# Step 8: Access the directory

```bash

cd MedGemma

```

# Step 9: Install the dependencies

```bash

npm install

```

# Step 10: Start the project

```bash

pm2 start server.js --name MedGemma

```

# Step 11: You should see MedGemma online.

# Access it in your browser

```bash

http://localhost:3001/

```






