var Event = {
  eventMap:{},
  on: function(eventType, hander){
    if(!this.eventMap[eventType]){
      this.eventMap[eventType] = [];
    }
    this.eventMap[eventType].push(hander);
  },
  fire: function(event){
    var eventType = event.type;
    if(this.eventMap[eventType]){
      for(var i = 0; i < this.eventMap[eventType].length; i++){
        this.eventMap[eventType][i](event);
      }
    }
  },
  off: function(eventType){
    for(var i = 0; i < this.eventMap[eventType].length; i++){
      if(this.eventMap[eventType][i] === hander){
        this.eventMap[eventType].splice(i, 1);
        break;
      }
    }
  }
}
function extend(obj, props) {
  for (var name in props) {
    if (Array.isArray(props[name])){
      if(!obj[name] || !Array.isArray(obj[name]) ) {
        obj[name] = [];
      }       
      extend(obj[name], props[name]);
    }    
    else if (typeof props[name] == 'object') {
      if(!obj[name] || typeof obj[name] !== 'object' ) {
        obj[name] = {};
      } 
      extend(obj[name], props[name]);
    } 
    else {
      obj[name] = props[name];
    }
  }
  return obj;
}

function parseElement(element, model, uid){
  var that = this;
  for (var i = 0; i < element.attributes.length; i++) {
    bindType(element,  element.attributes[i], model, uid);
  }  
  for (var j = 0; j < element.children.length; j++) {
    parseElement(element.children[j], model, uid);
  }  
}

function bind(obj, uid){
  for(prop in obj){
    var val = obj[prop];
    if(typeof val != 'function'){
      defineProp(obj, prop);      
    }
    obj[prop] = val;
  }
  function defineProp(obj, prop){
    var innerProp = "_" + prop;
    Object.defineProperty(obj, prop, {
      set: function(value) {
        var oldVal = this[innerProp];
        this[innerProp] = value;
        Event.fire({
          type: prop+ uid,
          oldVal: oldVal,
          val: value
        })
        console.log('trigger set: ', prop, value, oldVal);
      },
      get: function() {
        console.log('trigger get: ', prop, this[innerProp]);
        return this[innerProp];
      },
      enumerable: true,
      configurable: true
    });
  }  
  return obj;
}

function bindType(element, attr, model, uid) {
  if (attr.name.indexOf("v-") === 0) {
    var type = attr.name.slice(2);

    switch( type ){
      case "value":
      bindValue(element, attr.value, model, uid);
      break;
      case "click":
      bindClick(element, attr.value, model, uid);
      default:
      return false;
    }
  }
}
function bindValue(element, key, vm, uid){
  var tagName = element.tagName.toLowerCase();
  element.addEventListener('keyup', function(){
    vm[key] = element.value;
  }, false);
  Event.on(key + uid, function(event){
    switch (tagName) {
      case "input":
        element.value = event.val;
        break;
      case "p":
        element.textContent = event.val;
        break;
      default:
        element.textContent = event.val;
    }    
  }); 
}

function bindClick(element, key, vm, uid){
  element.addEventListener('click', function(){
    vm[key].call(vm);
  }, false);  
}

function Vue(config) {
  this.init.call(this, config);
}
extend(Vue.prototype, {
  init: function(config) {
    this.$uid = "Vue" + Math.random() + Date.now();
    this.$ele = document.querySelector(config.el) || document.body;
    this.$parseElement(this.$ele, config.data, this.$uid);
    this.$data = this.$bind(config.data, this.$uid);
  },
  $parseElement: parseElement, 
  $bind: bind
})

var app = new Vue({
  el:'#app',
  data: {
    name:'yangjunjun',
    age: 26,
    add: function(){
      this.age++;
    }
  }
})

var test = new Vue({
  el:'#test',
  data: {
    name:'test',
    age: 10,
    add: function(){
      this.age++;
    }    
  }
})