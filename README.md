# PasswordManagerNodeJs

## This is not the best way to implement a password manager. I created this because
### 1. I want to review and improve on my skills using node js and typescript
### 2. I want to be able to find a secure place to retrieve my passwords in case I forget one

## I do believe one-way hashing of passwords is more secure but I am doing two-way because of reason 2 above.


## These commands should be used in a bash terminal
### to install typescript globally, type ```sudo npm i -g typescript```

### to compile your typescript file into javascript, type ```tsc [your_file_name].ts```

### to create a typescript config file, type ```tsc --init```

### in your tsconfig.json file, change "target"'s value to "es6". Uncomment outDir and change its value to "./src". Uncomment the rootDir and changes its value to "./js_files", this is where all your js files will compile to when you execute your typescript code. Uncomment "moduleResolution" : "node" key/value pair.

### create a folder called "src" and move all your typescript files into it

### to set up a node project with, type ```npm init``` or shortcut the fill-in-the-blanks with ```npm init -y```

### to install dependencies (packages required for production), type ```npm i [name_of_package]```
### to install dev dependencies (packages not required for production), type ```npm i -D [name_of_package]```

### usually for my nodejs projects I install the following:
```npm i -D typescript ts-node nodemon @types/node @types/express```

### in the package.json, in the scripts section, add:
```"start": "node js_files/app.js``` and ```"dev": "nodemon src/app.ts"``` and ```"build": "tsc -p ."```

### to compile your typescript files in your rootDir, type ```tsc```



