/**
 * Copyright 2014 Sense Tecnic Systems, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var util = require("util");
var httpclient;

module.exports = function(RED) {
  "use strict";

  function CkantsInNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    node.resourceId = n.resourceId;
    node.fromtime = n.fromtime;
    node.totime = n.totime;
    node.auth = RED.nodes.getNode(n.auth);

    if (!node.resourceId){
      node.error("No resourceId specified");
      return;
    }

    if (!node.auth) {
      node.error("No credentials specified");
      return;
    }

    node.ckan = node.auth.ckan;
    node.token = node.auth.token;

    if (!node.ckan){
      node.error("No CKAN endpoint specified");
      return;
    }

    if (!node.token) {
      node.error("No CKAN token specified");
      return;
    }

    node.on("input",function(msg) {
      console.log('firing!');
      if (msg != null) {
        // execute http post, forward result
        var msg = {payload:'test'};
        node.send(msg)
      }
    });


    node.on('close', function() {
      return
    });
  }

  RED.nodes.registerType("ckants in",CkantsInNode);

  function CkantsOutNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    node.resourceId = n.resourceId;
    node.auth = RED.nodes.getNode(n.auth);

    if (!node.resourceId){
      node.error("No resourceId specified");
      return;
    }

    if (!node.auth) {
      node.error("No credentials specified");
      return;
    }

    node.ckan = node.auth.ckan;
    node.token = node.auth.token;

    if (!node.ckan){
      node.error("No CKAN endpoint specified");
      return;
    }

    if (!node.token) {
      node.error("No CKAN token specified");
      return;
    }

    node.on("input",function(msg) {
      console.log('firing!');
      if (msg != null) {
        // execute http post
      }
    });

    node.on('close', function() {
      return
    });
  }
  RED.nodes.registerType("ckants out",CkantsOutNode);

  function CkantsCredentialsNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    node.ckan = n.ckan;

    if (!node.ckan){
      node.error("No CKAN endpoint specified");
      return;
    }

    if (n.credentials) {
      node.token = n.credentials.token;
    }

    if (!node.token) {
      node.error("No CKAN token specified");
      return;
    }
  }

  RED.nodes.registerType("ckants-credentials", CkantsCredentialsNode, {
    credentials: {
      token: {type:"text"}
    }
  });

}