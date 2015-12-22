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

function parseElement(element, vm){
  for (var i = 0; i < element.attributes.length; i++) {
    bindType(element,  element.attributes[i], vm);
  }  
  for (var j = 0; j < element.children.length; j++) {
    parseElement(element.children[j], vm);
  }  
}

function bindType(element, attr, model) {
  if (attr.name.indexOf("v-") === 0) {
    var type = attr.name.slice(2);
    switch( type ){
      case "value":
      bindValue(element, attr.value, model);
      break;
      case "click":
      bindClick(element, attr.value, model);
      default:
      return false;
    }
  }
}

function bindValue(element, key, vm){
  var tagName = element.tagName.toLowerCase();
  vm.$watch(key, function(val, oldVal){
    switch (tagName) {
      case "input":
        element.value = val;
        break;
      case "p":
        element.textContent = val;
        break;
      default:
        element.textContent = val;
    }
  });
  
  element.addEventListener('keyup', function(){
    vm[key] = element.value;
  }, false);
}

function bindClick(element, key, vm){
  element.addEventListener('click', function(){
    vm[key].call(vm);
  }, false);  
}

var VM = {
  $watchers: {},
  $watch: function(key, watcher){
    if(!this.$watchers[key]){
      this.$watchers[key] = {
        value: this[key],
        list:[]
      };
      Object.defineProperty(this, key, {
        set: function(value) {
          console.log('set:',key, value);
          var oldVal = this.$watchers[key].value;
          this.$watchers[key].value = value;
          for( var i = 0; i < this.$watchers[key].list.length; i++){
            this.$watchers[key].list[i](value, oldVal);
          };
        },
        get: function() {
          return this.$watchers[key].value;
        },
        enumerable: true,
        configurable: true
      });
    };
    this.$watchers[key].list.push(watcher);  
    this[key] = this.$watchers[key].value;
  }
}

function Vue(config) {
  this.init.call(this, config);
}

extend(Vue.prototype, {
  init: function(config) {
    this.$uid = "Vue" + Math.random() + Date.now();
    this.$ele = document.querySelector(config.el) || document.body;
    this.$vm = extend(config.data, VM);
    this.$parseElement(this.$ele, this.$vm);
  },
  $parseElement: parseElement
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
});

var test = new Vue({
  el:'#test',
  data: {
    name:'test',
    age: 10,
    add: function(){
      this.age++;
    }    
  }
});