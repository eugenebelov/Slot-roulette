(function init() {

  var GameView = {
    preloader: document.getElementById("preloader"),
    gameSlotL: document.getElementById("gameSlotLeft"),
    gameSlotC: document.getElementById("gameSlotCenter"),
    gameSlotR: document.getElementById("gameSlotRight"),
    gameScene: document.getElementById("gameView"),
    list: document.getElementById("symbolSelectionList"),
    winAnimation: document.getElementById("winWin"),
    init: function() {
      document.addEventListener('updateSelectList', this.updateSelectList);
      document.addEventListener('allImagesLoaded', this.showGameScene);
      document.addEventListener('winEvent', this.showWin);
      document.addEventListener('loseEvent', this.showLose);
    },

    eventListeneter: function(element, type, callback) {
        var pfx = ["webkit", "moz", "MS", "o", ""];
        for (var p = 0; p < pfx.length; p++) {
          if (!pfx[p]) type = type.toLowerCase();

          element.addEventListener(pfx[p] + type, callback, false);
        }
    },

    showGameScene: function(e) {
      GameView.preloader.className = 'hidden';
      GameView.gameScene.className = 'view-game fadeIn animated';
    },

    showWin: function(e) {
      GameView.eventListeneter(GameView.winAnimation, 'AnimationEnd', function() {
        GameView.winAnimation.className = "winwin fadeOut animated";
      }, false);

      GameView.winAnimation.className = "winwin tada animated";

      GameView.winAnimation.innerHTML = 'You Win!';
    },

    showLose: function(e) {
      GameView.winAnimation.innerHTML = 'You Lose! <br/> Spin the wheel!';
    },

    updateSelectList:function(e) {
      var ulNodes = [];
      GameView.list = document.getElementById("symbolSelectionList");
      GameModel.get().forEach(function(obj, index) {
        GameView.list[index] = new Option(obj.title, obj.value);
        ulNodes.push("<li><img src=" + obj.image + " /></li>");
      });

      GameView.gameSlotL.innerHTML = ulNodes.join('');
      GameView.gameSlotC.innerHTML = ulNodes.join('');
      GameView.gameSlotR.innerHTML = ulNodes.join('');
      Game.selectSymbol(GameView.list[0].value);
    }
  };

  var GameModel = {
    fetch: function (path, callback) {
      var xmlhttp;

      if (window.XMLHttpRequest) {
          xmlhttp = new XMLHttpRequest();
      }
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 ) {
             if(xmlhttp.status == 200) {
                 return callback(xmlhttp.response);
             }
             else if(xmlhttp.status == 400) { console.log('There was an error 400') }
             else { console.log('something else other than 200 was returned') }
          }
      }
      xmlhttp.open("GET", path, true);
      xmlhttp.send();
    },

    fill: function(data) {
      GameModel.set(JSON.parse(data).types);
      GameModel.loadImage(JSON.parse(data).types);

      document.dispatchEvent(new CustomEvent("updateSelectList"));
    },

    loadImage: function(data) {
      var images = new Array()
      var count = 0;
      var val = 0;

      for (i = 0; i < data.length; i++) 
      {
        images[i] = new Image();
        images[i].onload = function() 
        {
          count++;
          if(count == i) {
            GameView.preloader.style.width = '100%';

            document.dispatchEvent(new CustomEvent("allImagesLoaded"));
          } else {
            val += 100 / i;
            GameView.preloader.style.width = (val + "%");
          }
        }
        images[i].src = data[i].image;
      }
    },

    set: function(model) {
      this.gameTypesList = model;
    },

    get: function() {
      return this.gameTypesList;
    }
  };

  window.Game = {
    start: function () {
      GameModel.fetch("./js/fake/fake-data.json", GameModel.fill);
    },

    selectSymbol: function(event) {
      this.userSelection = GameModel.get()[parseInt(event-1)];
      this.magic = [];
      var leng = 100;
      for(var i = 0; i < leng; i++) {
        if(i < parseInt(this.userSelection.k))
        {
          this.magic.push(1);
        } else {
          this.magic.push(0);
        }
      }
    },

    animate: function(elem, style, unit, from, to, time, finish, callback) {
      if( !elem) return;
      var numOfLoops = 3;
      var callbackHandler = callback;

      function doOneRotation (endCallback) 
      {
        var start = new Date().getTime();
        var interval = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / time);
                                      elem[0].style[style] = (from + step * (to - from)) + unit;
                                      elem[1].style[style] = (from + step * (to - from)) + unit;
                                      elem[2].style[style] = (from + step * (to - from)) + unit;
                                      if(step == 1)
                                      {
                                        clearInterval(interval);
                                        endCallback();
                                      }
                                    }, 20);

        elem[0].style[style] = from + unit;
        elem[1].style[style] = from + unit;
        elem[2].style[style] = from + unit;
      }

      function doFinishRotation () 
      {
        var start = new Date().getTime();
        var finishTime1 = (GameModel.get().length - finish[0]) * (500 / (GameModel.get().length - finish[0]));
        var finishTime2 = (GameModel.get().length - finish[1]) * (500 / (GameModel.get().length - finish[1]));
        var finishTime3 = (GameModel.get().length - finish[2]) * (500 / (GameModel.get().length - finish[2]));
        var interval1 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime1);
                                      elem[0].style[style] = (from + step * ((parseInt(finish[0]) * -155) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval1);
                                        callbackHandler();
                                      }
                                    }, 20);

        var interval2 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime2);
                                      elem[1].style[style] = (from + step * ((parseInt(finish[1]) * -155) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval2);
                                        callbackHandler();
                                      }
                                    }, 20);

        var interval3 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime3);
                                      elem[2].style[style] = (from + step * ((parseInt(finish[2]) * -155) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval3);
                                        callbackHandler();
                                      }
                                    }, 20);

        elem[0].style[style] = from + unit;
        elem[1].style[style] = from + unit;
        elem[2].style[style] = from + unit;
      }

      function whatNext()
      {
        numOfLoops--;
        (numOfLoops > 0) ? doOneRotation(whatNext) : doFinishRotation();
      }

      doOneRotation(whatNext);
      
    },

    getEndSpinElement: function(winflag) {
      if(winflag == 1) {
        return Game.userSelection.id;
      } else {
        var noWin = GameModel.get().concat();
        for(var i = 0; i < noWin.length; i++) {
          if(noWin[i].id === this.userSelection.id) {
            noWin.splice(i, 1);
          }
        }

        return noWin[Math.round(Math.random() * (noWin.length -1) )].id;
      }
    },

    spin: function() {
      var index1 = Math.round(Math.random() * 99);
      var index2 = Math.round(Math.random() * 99);
      var index3 = Math.round(Math.random() * 99);
      var isWin1 = this.randomize(this.magic)[index1];
      var isWin2 = this.randomize(this.magic)[index2];
      var isWin3 = this.randomize(this.magic)[index3];

      this.from = function() { return GameModel.get().length * -155 };

      console.log(isWin1, isWin2, isWin3)
      
      this.animate(
          [GameView.gameSlotL, GameView.gameSlotC, GameView.gameSlotR], "top", "px", 
          this.from(), 0, 200, 
          [this.getEndSpinElement(isWin1), this.getEndSpinElement(isWin2), this.getEndSpinElement(isWin3)],
          function() {
            if(isWin1 == 1 && isWin2 == 1 ||
              isWin2 == 1 && isWin3 == 1 ||
              isWin3 == 1 && isWin1 == 1 ||
              isWin1 == 1 && isWin2 == 1 && isWin3 == 1)
            {
              document.dispatchEvent(new CustomEvent("winEvent"));
            } else {
              document.dispatchEvent(new CustomEvent("loseEvent"));
            }
              
          }
      );
      
    },

    randomize: function(array) {
        return array.sort(function(a, b) {
            return Math.round(Math.random());
        });
    }
  }

  Game.start();
  GameView.init();

})();