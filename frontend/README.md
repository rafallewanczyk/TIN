# Frontend app for TIN application
## Run
In order to run the app:
- download the node.js from their official [SITE](https://nodejs.org/en/) 

### Next you will need two terminals to open a mock app.
- #### In first terminal
  - go to the folder `.../tin/frontend` and type in console 
```shell script
npm install -g yarn
yarn
yarn start
```
- If you encounter this error
```text
Error: Cannot find module 'antd/dist/theme'
```
go to the file `package.json` in `/frontend` folder and change line
```text
"antd": "4.1.4"
```
to
```text
"antd": "4.1.3"
```

When the installation and errors finishes:
 - #### In second terminal
   - In the same folder `.../tin/frontend` type:
```shell script
nodemon ./src/mock/index.js
```

After about 2 min the browser window should pop up with the project. Only tested in CHROME other browser might not work.

Sidenote.
App is working with the mock server so part of functionalities are working and some of them are not.

if you want to simulate errors you can add theese lines in line 100 in file `/src/mock/index.js`:
```javascript
app.use((req, res, nex) => {
  res.status(400).send();
})
```
after change server should restart automatically.
