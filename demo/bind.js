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
function clone(obj) {
  var tmp = Array.isArray(obj) ? []: {};
  (function mid(obj, tmp) {
    for (var name in obj) {
      if (Array.isArray(obj[name])) {
        tmp[name] = [];
        mid(obj[name], tmp[name]);
      }
      else if (typeof obj[name] == 'object'){
        tmp[name] = {};
        mid(obj[name], tmp[name]);
      }
      else {
        tmp[name] = obj[name];
      }
    }
  })(obj, tmp);
  return tmp;
}
var reg = /\{\{(\w*)\}\}/g;

function parseElement(element, vm){
  if(element.children.length == 0){
    bindHTML(element, vm);
  }
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
      break;
      case "for":
      bindFor(element, attr.value, model);
      break;
      default:
      return false;
    }
  }
}

function bindHTML(element, vm){
  var text = element.textContent;
  var result = null; 
  var key = [];
  while((result=reg.exec(text)) != null){
    key.push(result[1])
  };
  key.forEach(function(item){
    vm.$watch(item, function(val, oldVal){
      element.textContent = text.replace(reg, function(match, p1){
        return vm[p1];
      });
    });
  });
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

function bindFor(element, key, vm){
  var parentEle = element.parentElement;
  var text = element.innerHTML;
  var result = [];
  var prop = key.split(' ')[0];
  var key =  key.split(' ')[2]
  var reg = new RegExp("{{todo\\.(\\w*)}}","g");
  vm.$watch(key, function(val, oldVal){
    parentEle.innerHTML = "";
    val.forEach(function(item, index){
      var temp = text.replace(reg, function(match, p1){
        return item[p1];
      });
      temp = temp.replace(/\$index/, index);           
      var li = element.cloneNode();
      li.removeAttribute('v-for');
      li.innerHTML = temp;   
      parentEle.appendChild(li);
    });
    parseElement(parentEle, vm);
  })
}

function bindClick(element, key, vm){
  var reg = /(\w+)(?:\(([\w$]+)\))?/;
  var result = reg.exec(key);
  var key = result[1];
  var para = result[2];
  element.addEventListener('click', function(){
    vm[key].call(vm, para);
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

// var app = new Vue({
//   el:'#app',
//   data: {
//     name:'yangjunjun',
//     age: 26,
//     gender: 'male',
//     newTodo: '',
//     todos: [
//       { text: 'Learn JavaScript' },
//       { text: 'Learn Vue.js' },
//       { text: 'Build Something Awesome' }
//     ],    
//     add: function(){
//       this.age++;
//     },
//     push: function(){
//       this.todos.push({
//         text: this.newTodo
//       });
//       this.todos = clone(this.todos);
//       this.newTodo = "";
//     },
//     removeTodo:function(index){
//       var temp = clone(this.todos);
//       temp.splice(index, 1);
//       this.todos = temp;
//     }
//   }
// }); 

// var test = new Vue({
//   el:'#test',
//   data: {
//     name:'yangjunjuntest',
//     age: 52,
//     gender: 'male',
//     add: function(){
//       this.age++;
//     }
//   }
// });