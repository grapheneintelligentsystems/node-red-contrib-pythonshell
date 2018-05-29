var fs = require("fs");

function PythonshellInNode(config) {
  if (!config.pyfile){
    throw 'pyfile not present';
  }

  this.pyfile = config.pyfile;
  this.virtualenv = config.virtualenv;

  if (!fs.existsSync(this.pyfile)) {
    throw 'pyfile not exist';
  }

  if (this.virtualenv && !fs.existsSync(this.virtualenv)){
    throw 'configured virtualenv not exist, consider remove or change';
  }

  this.stdInData = config.stdInData;
  this.continuous = this.stdInData ? true : config.continuous;
  this.pydir = this.pyfile.substring(0, this.pyfile.lastIndexOf('/'));
  this.pyfile = this.pyfile.substring(this.pyfile.lastIndexOf('/') + 1, this.pyfile.length);
  this.spawn = require('child_process').spawn;
  this.onStatus = ()=>{}
}

PythonshellInNode.prototype.onInput = function(msg, out, err) {
  msg = msg.payload || '';
  if (typeof msg === 'object'){
    msg = JSON.stringify(msg);
  } else if (typeof msg !== 'string'){
    msg = msg.toString();
  }

  if (msg === 'pythonshell@close' && this.py != null){
    this.onClose()
    return
  }

  if (this.continuous && this.py != null){
    this.onStatus({fill:"yellow",shape:"dot",text:"Not accepting input"})
    return
  }

  var spawnCmd = (this.virtualenv ? this.virtualenv + '/bin/' : '') + 'python'

  if (this.stdInData){
    if (!this.py){
      this.py = this.spawn(spawnCmd, ['-u', this.pyfile], {
        cwd: this.pydir
      });
      this.firstExecution = true
    } else {
      this.firstExecution = false
    }
  } else {
    this.py = this.spawn(spawnCmd, ['-u', this.pyfile, msg], {
      cwd: this.pydir
    });
  }

  // subsequence message, no need to setup callbacks
  if (this.stdInData && !this.firstExecution){
    if (msg !== 'pythonshell@close'){
      this.py.stdin.write(msg + '\n')
    }
    return
  }

  var py = this.py;
  var dataString = '';
  var errString = '';

  py.stdout.on('data', data => {
    let dataStr = data.toString().trim();

    if (this.continuous){
      dataString = dataStr;
      out({payload: dataString});
    } else {
      dataString += dataStr;
    }
    this.onStatus({fill:"green",shape:"dot",text:"Running"})
  });

  py.stderr.on('data', data => {
    errString += String(data);// just a different way to do it
    this.onStatus({fill:"red",shape:"dot",text:"Error: " + errString})
  });

  py.on('close', code =>{
    if (code){
      err('exit code: ' + code + ', ' + errString);
      this.onStatus({fill:"red",shape:"dot",text:"Exited: " + code})
    } else if (!this.continuous){
      out({payload: dataString.trim()});
      this.onStatus({fill:"green",shape:"dot",text:"Done"})
    } else {
      this.onStatus({fill:"yellow",shape:"dot",text:"Script Closed"})
    }
    this.py = null
    setTimeout(()=>{
      this.onStatus({})
    }, 2000)
  });

  if (this.stdInData){
    py.stdin.write(msg + '\n')
  }
};

PythonshellInNode.prototype.onClose = function() {
  if (this.py){
    this.py.kill()
    this.py = null
  }
};

PythonshellInNode.prototype.setStatusCallback = function(callback) {
  this.onStatus = callback
};


module.exports = PythonshellInNode