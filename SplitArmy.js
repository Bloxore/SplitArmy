/* Engine Constants */
/* Pallet */
  const COLORS = ["#332c50","#46878f","#94e344","#e2f3e4","#3fac95"];
  /* FX */
  const CIRCLE_TRANSITION = 0x0001;
  const FADE = 0x0010;
  const FLASH = 0x0100;
  /* States */
  const GAME_STATE = 1;
  const MENU_STATE = 2;
  const PRESTAGE_STATE = 3;
  const END_STATE = 4;
  /* Game Size */
  const WIDTH = 480;
  const HEIGHT = 480;
  const TILEWIDTH = WIDTH/10;
  const TILEHEIGHT = 226/5;

  const DEBUG = true;

  const AUDIOFILES = [
    {
      name: "Title Screen",
      src: "audio/TITLE.wav",
      loop: true
    }
  ]

  let _lastTime = Date.now();
  let deltaTime = 1;
  let fullscreen = false;
  window.onload = () => {
      /* Game div */
      let _gameDiv = document.getElementById("game");
      /* Background layer */
      let _bgCanvas = document.createElement("CANVAS");
      _bgCanvas.width = WIDTH;
      _bgCanvas.height = HEIGHT;
      let _bgCtx = _bgCanvas.getContext("2d");
      /*Pixel Perfect*/
      _bgCtx.imageSmoothingEnabled = false;
      /*Scale up game*/
      _bgCtx.scale(2,2);
      /* Foreground layer */
      let _canvas = _gameDiv.appendChild(document.createElement("CANVAS"));
      _canvas.width = WIDTH;
      _canvas.height = HEIGHT;
      let _ctx = _canvas.getContext("2d");
      /*Pixel Perfect*/
      _ctx.imageSmoothingEnabled = false;
      /*Scale up game*/
      _ctx.scale(2,2);

      let f = _gameDiv.parentNode.appendChild(document.createElement("DIV"));
      f.id = "f";
      f.className = "button";
      f.innerHTML = "Fullscreen";

      /* Assign graphics their own variable */
      let graphics = document.createElement("IMG");
      graphics.src = "graphics/graphics.png";
      let _tiles = document.createElement("IMG");
      _tiles.src = "graphics/tiles.png";
      let sounds = {};

      let objects = [];
      let objId = 0;
      let mouse = {x:0,y:0,down:false,click:false,up:false};
      let fx = {};
      let sineOffset = 0;

      /* Game variables */
      let groups;
      let enemyGroups;
      let whichEnemy;
      let movingGroup;
      let message;
      let buildings;
      let menuActive;
      let turn;
      let attackGroup;
      let gameState;
      let level;
      let mission;
      let currentBuilding = 0;
      let enablePlayer;
      let _tileSelector;
      let _tileLayout = [];
      let _dialogueBox;
      let unitStorage = 0;
      let round = 0;
      let actionLimit;

      /* Objects */
      const GameObject = (x,y) => {
          let state = {
            x,
            y,
            zIndex: 0,
            ID: 0,
            alpha: 1,
            draw: () => {},
            update: () => {},
            fade: (time,alpha,callBack) => {
              let speed = (1000/time)*(alpha - state.alpha)/60;
              add(Timer(time,()=> {
                if (callBack) {
                  callBack();
                }
              },()=> {
                state.alpha += speed*deltaTime;
                if (state.alpha < 0)
                  state.alpha = 0;
                if (state.alpha > 1)
                  state.alpha = 1;
              }))
            },
          }
          return state;
      };

      const Troop = (x,y,frame) => {
          /* Have troop extend GameObject */
          let state = Object.assign(
            GameObject(x,y),
            {
              zIndex: 1,
              frame,
              group: 1,
              goto: null,
              draw: () => {
                _ctx.drawImage(graphics,state.frame*16,0,16,16,state.x,state.y,16,16);
              },
              update: () => {
                if (state.goto != null) {
                    state.x += (Math.floor(state.goto[0] - state.x)/3)*deltaTime;
                    state.y += (Math.floor(state.goto[1] - state.y)/3)*deltaTime;
                    if (state.x == state.goto[0] && state.y == state.goto[1])
                        state.goto = null;
                }
              },
            },
          );

          return state;
      };
      /* Building ideas:
      Attack tower
      Make more guys building
      Wall to stall for time
      */
      const Building = (x,y,type, display) => {
          /* Combine objects */
          let state = Object.assign(
            GameObject(x,y),
            {
              mpBuild: 10,
              zIndex: 1,
              type,
              tile: [],
              draw: () => {
                // Put into display mode
                if (display == true) {
                  state.x = (state.x-8) / TILEWIDTH;
                  state.y = (state.y-21.25) / TILEHEIGHT;
                }
                if (state.type = "t") {
                    _ctx.drawImage(graphics,16,16,32,16,state.x*TILEWIDTH+8,state.y*TILEHEIGHT + 21.25,32,16);
                    _ctx.drawImage(graphics,48,16,32,16,state.x*TILEWIDTH+8,state.y*TILEHEIGHT + 21.25+16,32,16);
                    state.mpBuild = 10;
                }
                // Revert back to normal
                if (display == true) {
                  state.x = state.x * TILEWIDTH + 8;
                  state.y = state.y * TILEHEIGHT + 21.25;
                }
              },
              action: () => {
                targetSprite(state,1000,() => {
                  if (state.type == "t") {
                    let range = 2;
                    for (let i=0; i < enemyGroups.length; i++) {
                        if (Math.sqrt(Math.pow(enemyGroups[i].x - state.x,2)+Math.pow(enemyGroups[i].y - state.y,2)) <= range) {
                            enemyGroups[i].members.splice(0,Math.ceil(enemyGroups[i].members.length/10));
                            //Kill enemy if out of health
                            if (enemyGroups[i].members.length < 1){
                              enemyGroups[i].fade(200,0,() => {
                                enemyGroups[i].kill();
                              });
                            }
                        }
                    }
                  }
                  //Add a short buffer between building actions
                  add(Timer(200,() => {
                    buildingsActions();
                  }))
                });
              },
              kill: () => {
                for (let i=0;i<buildings.length;i++)
                  if (buildings[i].ID == state.ID)
                    buildings.splice(i,1);
                remove(state);
              },
            }
          );
          return state;
      };

      const SplitSelector = (group, additionalAction, callBack) => {
        menuActive = true;
        let state = Object.assign(
          GameObject(0,0),
          {
            ammountToSplit: group.members.length,
            zIndex: 100,
            _width: WIDTH,
            _height: 0,
            active: false,
            upArrowDown: false,
            downArrowDown: false,
            sendBtnDown: false,
            draw: () => {
              state.update();
              if (state.zIndex == 0) //Menu is removed
                return;
              //Background
              _ctx.strokeStyle = COLORS[1];
              _ctx.lineWidth = 20;
              _ctx.rect(0, HEIGHT / 4 - state._height / 2 - 10, state._width, state._height+20);
              _ctx.stroke();
              _ctx.fillStyle = COLORS[3];
              _ctx.rect(0, HEIGHT / 4 - state._height / 2, state._width, state._height);
              _ctx.fill();
              if (state.active == true) {
                //Text
                _ctx.fillStyle = COLORS[0];
                _ctx.textAlign = "center";
                _ctx.font = "16px Arial Black";
                _ctx.fillText("Send how many?",120, 40);

                _ctx.font = "32px Arial Black";
                _ctx.fillText(state.ammountToSplit,120, 120);
                //Graphics
                //Up arrow
                _ctx.translate(180,110);
                _ctx.scale(2,2);
                if (state.upArrowDown == true) {
                  _ctx.drawImage(graphics,16*5,16*2,16,16,-8,-8,16,16);
                } else {
                  _ctx.drawImage(graphics,16*4,16*2,16,16,-8,-8,16,16);
                }
                _ctx.scale(.5,.5);
                _ctx.translate(-180,-110);
                //down arrow
                _ctx.translate(60,110);
                _ctx.scale(2,2);
                if (state.downArrowDown == true) {
                  _ctx.drawImage(graphics,16,16*3,16,16,-8,-8,16,16);
                } else {
                  _ctx.drawImage(graphics,0,16*3,16,16,-8,-8,16,16);
                }
                _ctx.scale(.5,.5);
                _ctx.translate(-60,-110);

                //Cancel Button
                /* Start Button */
                let bP = {x: 175 - 50, y: 170}
                if (state.sendBtnDown == true) {
                  bP = {x: 175 - 50, y: 175}
                }
                _ctx.strokeStyle = COLORS[4];
                _ctx.lineWidth = 2;
                _ctx.fillStyle = COLORS[1];
                _ctx.beginPath();
                _ctx.rect(bP.x,bP.y,100,30);
                _ctx.fill();
                _ctx.stroke();
                if (state.sendBtnDown == false) {
                  _ctx.fillStyle = COLORS[0];
                  _ctx.beginPath();
                  _ctx.rect(bP.x - 1,bP.y + 31,102,5);
                  _ctx.fill();
                }
                _ctx.fillStyle = COLORS[3];
                _ctx.textAlign = "center";
                _ctx.font = "bold 18px Arial";
                if (state.ammountToSplit == group.members.length) {
                  _ctx.fillText("Send All",bP.x + 50,bP.y + 22);
                } else {
                  _ctx.fillText("Split",bP.x + 50,bP.y + 22);
                }

              }
            },
            update: () => {
              if (additionalAction == "stop" || groups.length > 1) {
                state.zIndex = 0;
                menuActive = false;
                remove(state);
                callBack(group);
              }

              //Up arrow selection
              if (164 < mouse.x && mouse.x < 196 && 94 < mouse.y && mouse.y < 126 && mouse.down) {
                state.upArrowDown = true;
              } else if (164 < mouse.x && mouse.x < 196 && 94 < mouse.y && mouse.y < 126 && mouse.up) {
                if (state.ammountToSplit < group.members.length)
                  state.ammountToSplit++;

                mouse.up = false;
              } else {
                state.upArrowDown = false;
              }
              //Down arrow selection
              if (44 < mouse.x && mouse.x < 76 && 94 < mouse.y && mouse.y < 126 && mouse.down) {
                state.downArrowDown = true;
              } else if (44 < mouse.x && mouse.x < 76 && 94 < mouse.y && mouse.y < 126 && mouse.up) {
                if (state.ammountToSplit > 1)
                  state.ammountToSplit--;

                mouse.up = false;
              } else {
                state.downArrowDown = false;
              }
              //Send button selection
              if (125 < mouse.x && mouse.x < 225 && 168 < mouse.y && mouse.y < 203 && mouse.down) {
                state.sendBtnDown = true;
              } else if (125 < mouse.x && mouse.x < 225 && 168 < mouse.y && mouse.y < 203 && mouse.up) {
                //Initiate split
                mouse.up = false;
                menuActive = false;
                remove(state);
                if (state.ammountToSplit < group.members.length) {
                  callBack(group.split(state.ammountToSplit));
                } else {
                  callBack(group);
                }
              } else {
                state.sendBtnDown = false;
              }

            }
          }
        );
        add(Timer(125,() => {
          state._height = 200;
          state.active = true;
        }, () => {
          state._height += (200/7.5)*deltaTime;
        }))
        return state;
      }

      const BuildingMenu = (group) => {
        /* Menu's variables */
          let items = ["t","t","t","t","t","t"];
          let descriptions = [
            "Attack Tower\n[10 MP]\nProvide assualt\nwithout risk at\nthe cost of MP."
          ];

          let state = Object.assign(
            GameObject(0,0),
            {
              zIndex: 100,
              dummyBuildings: [],
              hover: null,
              draw: () => {
                state.update();
                _ctx.textAlign = "center";
                _ctx.strokeStyle = COLORS[0];
                _ctx.lineWidth = 10;
                _ctx.fillStyle = COLORS[3];
                _ctx.beginPath();
                _ctx.rect(0,0,240,240);
                _ctx.fill();
                _ctx.stroke();
                _ctx.lineWidth = 2;
                _ctx.fillStyle = COLORS[1];
                _ctx.font = "bold 18px Arial"
                _ctx.fillText("Building Menu",120,24);
                _ctx.font = "bold 6px Arial"
                for (let i=0;i<items.length;i++) {
                    state.dummyBuildings[i].draw();
                    if (descriptions[i]) {
                        _ctx.fillStyle = COLORS[1];
                        let text = descriptions[i].split("\n");
                        for (let t=0;t<text.length;t++) {
                           if (t==0)
                               _ctx.font = "bold 7px Arial";
                            else
                               _ctx.font = "bold 6px Arial";
                            _ctx.fillText(text[t],state.dummyBuildings[i].x+16,state.dummyBuildings[i].y + 40 + 10*t);
                        }
                    }
                }
                /* Back Button */
                _ctx.drawImage(graphics,80,16,16,16,14,10,16,16);
                /* Flavor text */
                _ctx.fillText("Group's MP: " + group.members.length,120,230);
                _ctx.textAlign = "left";
                if (state.hover != null) {
                    _ctx.beginPath();
                    _ctx.rect(state.hover.x-11,state.hover.y-5,56,90);
                    _ctx.stroke();
                }
              },
              update: () => {
                menuActive = true;
                /* Check mouse position around each time and draw
                a rectangle around it if selected */
                state.hover = null;
                if (state.dummyBuildings)
                for (var i=0;i<state.dummyBuildings.length;i++) {
                    if (mouse.x > state.dummyBuildings[i].x-10 && mouse.x < state.dummyBuildings[i].x + 42 && mouse.y > state.dummyBuildings[i].y-5 && mouse.y < state.dummyBuildings[i].y + 85) {
                        state.hover = {x:state.dummyBuildings[i].x,y:state.dummyBuildings[i].y};
                        /* If clicked place build */
                        if (mouse.click && group.members.length >= state.dummyBuildings[i].mpBuild) {
                            mouse.click = false;
                            group.actions -= 1;
                            /* Not to be confused with state.dummyBuildings (this is the global array) */
                            let buildingType = state.dummyBuildings[i].type;
                            _tileSelector.start(group.x,group.y,1,(pos) => {
                              let localBuilding = add(Building(pos[0],pos[1],buildingType));
                              localBuilding.tile = pos;
                              buildings.push(localBuilding);
                              //Check player status
                              playerAction();
                            });
                            state.close();
                        }
                    }
                }
                /* Close menu if click on back button */
                if (mouse.x > 14 && mouse.x < 30 && mouse.y > 10 && mouse.y < 26 && mouse.click) {
                    state.close();
                    playerAction();
                }
              },
              close: () => {
                for (let i=0;i<state.dummyBuildings.length;i++) {
                    remove(state.dummyBuildings[i]);
                }
                remove(state);
                menuActive = false;
              },
            }
          );

          /* Add building sprites to dummyBuildings array */
          for (let i=0;i<items.length;i++) {
            state.dummyBuildings.push(add(Building(20+55*(i%4),90*(Math.floor(i/4)+1) - 50,items[i],true)));
          }

          return state;
      };

      /* The group's x and y are measured in tiles, not cordinates */
      const Group = (x,y,enemy) => {
          let state = Object.assign(
            GameObject(x,y),
            {
              zIndex: 3,
              range: 3,
              enemy: false,
              members: [],
              group: "A",
              goto: null,
              list: null,
              actions: 3,
              resistance: 1,
              playerTarget: null,
              attackSelectionFlag: false,
              draw: () => {
                state.update();
                _ctx.globalAlpha = state.alpha;
                for (let i=0;i<state.members.length;i++){
                    state.members[i].update();
                    state.members[i].x += state.x*TILEWIDTH+18;
                    state.members[i].y += state.y*TILEHEIGHT+26.5;
                    state.members[i].draw();
                    state.members[i].x -= state.x*TILEWIDTH+18;
                    state.members[i].y -= state.y*TILEHEIGHT+26.5;
                }
                _ctx.lineWidth = 2;
                if (enemy == true) {
                    _ctx.beginPath();
                    _ctx.strokeStyle = COLORS[0];
                    _ctx.rect(state.x*TILEWIDTH+4,state.y*TILEHEIGHT +16.5,40,40);
                    _ctx.stroke();
                    /*Group info*/
                    _ctx.beginPath();
                    _ctx.fillStyle = COLORS[0];
                    _ctx.rect(state.x*TILEWIDTH + 32,state.y*TILEHEIGHT + 46.5,12,10);
                    _ctx.fill();
                    /*Info text*/
                    _ctx.fillStyle = COLORS[3];
                    _ctx.font = "bold 8px Arial"
                    _ctx.fillText(state.members.length,state.x*TILEWIDTH + 33.5,state.y*TILEHEIGHT + 54.5);
                    if (state.attackSelectionFlag == true) {
                      _ctx.drawImage(graphics, 16*2, 16*3, 16, 16, state.x*TILEWIDTH, state.y*TILEHEIGHT + 12 + Math.sin(Date.now()/500)*5, 16, 16)
                    }
                } else {
                    /*Circle around group*/
                    _ctx.beginPath();
                    _ctx.strokeStyle = COLORS[0];
                    _ctx.arc(state.x*TILEWIDTH+24,state.y*TILEHEIGHT+36.5,24,0,Math.PI*2);
                    _ctx.stroke();
                    /*Group info*/
                    _ctx.beginPath();
                    _ctx.fillStyle = COLORS[0];
                    _ctx.rect(state.x*TILEWIDTH + 22,state.y*TILEHEIGHT + 50.5,30,10);
                    _ctx.fill();
                    //Weight image
                    if (state.members.length <= 25) {
                      _ctx.drawImage(graphics, (3 + state.range) * 16, 3 * 16, 16, 16, state.x*TILEWIDTH + 44,state.y*TILEHEIGHT + 51, 8, 9)
                    } else {
                      _ctx.drawImage(graphics, 3 * 16, 3 * 16, 16, 16, state.x*TILEWIDTH + 44,state.y*TILEHEIGHT + 51, 8, 9)
                    }
                    /* Action counter */
                    _ctx.beginPath();
                    _ctx.arc(state.x*TILEWIDTH + 6,state.y*TILEHEIGHT + 18.5,5,0,Math.PI*2);
                    _ctx.fill();
                    /*Info text*/
                    _ctx.beginPath();
                    _ctx.fillStyle = COLORS[3];
                    _ctx.font = "bold 8px Arial"
                    _ctx.fillText(state.group + ": " + state.members.length,state.x*TILEWIDTH + 22.5,state.y*TILEHEIGHT + 58.5);
                    _ctx.fillText(state.actions,state.x*TILEWIDTH+3.25,state.y*TILEHEIGHT+21.5);
                }
                /* If the group has resistance, give 'em a shield */
                if (state.resistance > 1) {
                  for (let i = 1; i < state.resistance; i++)
                    _ctx.drawImage(graphics, 16*6, 16*2, 16, 16, state.x*TILEWIDTH + 32, state.y*TILEHEIGHT + 8 + i*3, 16, 16)
                }
                _ctx.globalAlpha = 1;
                state.attackSelectionFlag = false;
              },
              update: () => {
                //Set range
                if (state.members.length <= 5) {
                  state.range = 3
                } else if (state.members.length <= 15) {
                  state.range = 2;
                } else if (state.members.length <= 25) {
                  state.range = 1;
                } else {
                  //Only to attack and split
                  state.range = 1;
                }
                if (mouse.up == true && mouse.x > state.x*TILEWIDTH && mouse.x < state.x*TILEWIDTH + 48 && mouse.y > state.y*TILEWIDTH && mouse.y < state.y*TILEWIDTH + 45) {
                    if (enemy != true) {
                        /* Create action command list; only if player is enabled*/
                        if (enablePlayer == true && state.list == null && movingGroup == false && state.actions > 0 && message == false && menuActive == false && attackGroup == null && !fx.type && _tileSelector.open == false) {
                            /* Delete all other group's lists, but be sure the group exists first.*/
                            /*for (let i=0;i<groups.length;i++) {
                                if (groups[i].list != null && groups[i].list.active == -1) {
                                    remove(groups[i].list);
                                    groups[i].list = null;
                                }
                                if (groups[i].list != null && groups[i].list.active != -1)
                                    return;
                            }*/
                            /* Disable click */
                            mouse.up = false;
                            //Old Code, used to bring up list
                            //state.list = add(List(mouse.x - 5,mouse.y - 5,state));
                            movingGroup = true;
                            state.move();
                        }
                    }
                }
                if (state.goto != null) {
                    state.x += ((state.goto[0] - state.x)/3)*deltaTime;
                    state.y += ((state.goto[1] - state.y)/3)*deltaTime;
                    if (Math.round(state.x) == Math.round(state.goto[0]) && Math.round(state.y) == Math.round(state.goto[1]))
                        state.goto = null;
                }
                if (state.enemy == false) {
                    if (state.x > 240)
                        state.goto = [220,state.y];
                    else if (state.x < 0)
                        state.goto = [20,state.y];
                    if (state.y > 240)
                        state.goto = [state.x,220];
                    else if (state.y < 0)
                        state.goto = [state.x,20];
                }
              },
              attack: (attacker, callBack) => {
                add(AttackOverlay(attacker,state, () => {
                  //The attacker and defender will "capture" half the enemies they kill
                  let attackerCapture = Math.floor(Math.ceil(attacker.members.length/Math.sqrt(state.resistance))/2);
                  if (attackerCapture > state.members.length/2) {
                    attackerCapture = state.members.length/2;
                  }
                  //Don't forget to calculate resistance as well
                  state.members.splice(0,Math.ceil(attacker.members.length/Math.sqrt(state.resistance)));
                  attacker.actions -= 1;
                  /* Attacking group also takes loses */
                  let defenderCapture = Math.floor(Math.ceil(state.members.length)/2);
                  if (defenderCapture > attacker.members.length/2) {
                    defenderCapture = attacker.members.length/2;
                  }
                  attacker.members.splice(0,Math.ceil(state.members.length));

                  /* Delete dead groups */
                  if (state.members.length < 1){
                      state.fade(200,0,() => {
                        state.kill();
                      });
                  } else {
                    createTroops(defenderCapture, 0, 0, state);
                  }

                  if (attacker.members.length < 1){
                      attacker.fade(200,0,() => {
                        attacker.kill();
                      });
                  } else {
                    createTroops(attackerCapture, 0, 0, attacker);
                  }

                  shuffleGroup(attacker,12);
                  shuffleGroup(state,12);
                  /* If either group needs to be faded start a timer */
                  if (attacker.members.length < 1 || state.members.length < 1) {
                    add(Timer(300,() => {
                      /* Check player status */
                      callBack();
                    }));
                  } else {
                    /* Check player status */
                    callBack();
                  }
                }));
              },
              moveTo: (x,y,callBack,customTime) => {
                //Move tile by tile
                let path = pathFind(state.x, state.y, x ,y);
                let currentDest;
                if (path.length > 0) {
                  currentDest = path[0];
                } else {
                  currentDest = {x: x, y: y};
                }

                let time = 400;
                if (customTime)
                  time = customTime;
                let speed = {
                  x: (currentDest.x - state.x)/((time/1000)*60),
                  y: (currentDest.y - state.y)/((time/1000)*60)
                }
                add(Timer(time,() => {
                  state.x = currentDest.x;
                  state.y = currentDest.y;
                  if (currentDest.x == x && currentDest.y == y) {
                    // Misson Complete
                    if (callBack)
                      callBack();
                  } else {
                    // Keep going
                    state.moveTo(x, y, callBack, customTime);
                  }
                },() => {
                  state.x += speed.x*deltaTime;
                  state.y += speed.y*deltaTime;
                  if (speed.x > 0 && state.x > currentDest.x || speed.x < 0 && state.x < currentDest.x) {
                    state.x = currentDest.x;
                  }
                  if (speed.y > 0 && state.y > currentDest.y || speed.y < 0 && state.y < currentDest.y) {
                    state.y = currentDest.y;
                  }
                }));
              },
              kill: () => {
                    state.actions = 0;
                    remove(state);
                    if (state.enemy == true) {
                        for (let i=0;i<enemyGroups.length;i++) {
                            if (enemyGroups[i].ID == state.ID)
                                enemyGroups.splice(i,1);
                        }
                    } else {
                        for (let i=0;i<groups.length;i++) {
                            if (groups[i].ID == state.ID)
                                groups.splice(i,1);
                        }
                    }
              },
              split: (ammount) => {
                let newGroup;
                if (state.members.length < 2)
                    return;

                /*Split the group, for players do not allow more than two groups*/
                if (enemy == true) {
                    newGroup = pushGroup(state.x, state.y,true);
                } else {
                    if (groups.length >= 2)
                        return;
                   newGroup = pushGroup(state.x, state.y);
                }
                newGroup.actions = state.actions;
                newGroup.members = state.members.splice(0,ammount);
                shuffleGroup(state,12);
                shuffleGroup(newGroup,12);
                //As to make spliting not completely overpowered
                state.actions -= 1;
                return newGroup;
              },
              join: (group, callback) => {
                //Join members
                group.actions = state.actions;
                group.fade(100,0,() => {
                  state.members = state.members.concat(group.members);
                  shuffleGroup(state,12);
                  group.kill();
                  if (callback)
                    callback();
                });
              },
              move: (range) => {
                let limit = state;
                let enemy = [false, 0]
                //If no custom range is given use default, if a custom range is given, limit the movement.
                if (range == null) {
                  range = state.range;
                } else {
                  limit = null;
                }
                _tileSelector.start(state.x,state.y,range,(pos) => {
                  //If selected self then rest
                  if (pos[0] == state.x && pos[1] == state.y) {
                    //Added bonus of resistance when resting
                    state.resistance = 1 + state.actions;
                    state.actions = 0;
                    playerAction();
                    return;
                  }
                  let skip = false;
                  if (limit == null || actionLimit == "move") {
                    skip = true;
                  }
                  for (let e=0; e < enemyGroups.length; e++) {
                    if (pos[0] == enemyGroups[e].x && pos[1] == enemyGroups[e].y) {
                      enemy = [true, e];
                      //If enemy is too close, don't give option to split
                      if (Math.sqrt(Math.pow(enemyGroups[e].x - state.x, 2) + Math.pow(enemyGroups[e].y - state.y, 2)) <= 1) {
                        skip = true;
                      }
                    }
                  }
                  add(List(mouse.x - 5,mouse.y - 5,state, skip, enemy[0],(actionToPerform) => {
                    let additionalAction = "normal";
                    if (actionToPerform == "Move" || actionToPerform == "Attack") {
                      additionalAction = "stop";
                    }
                    add(SplitSelector(state, additionalAction, (actionGroup) => {
                      //Check if enemy exists in position
                      if (enemy[0] == true) {
                        calculateTileLayout(actionGroup);
                        safePath = pathFind(actionGroup.x, actionGroup.y, enemyGroups[enemy[1]].x, enemyGroups[enemy[1]].y)
                        if (safePath[safePath.length - 2]) {
                          pos[0] = safePath[safePath.length - 2].x;
                          pos[1] = safePath[safePath.length - 2].y;
                        } else {
                          pos[0] = actionGroup.x;
                          pos[1] = actionGroup.y;
                        }
                      }
                      //Check to see if player will move
                      if (pos[0] == state.x && pos[1] == state.y) {
                        //Player will not move
                      } else {
                        //Check for other player groups to merge
                        for (let p=0; p < groups.length; p++) {
                          if (pos[0] == groups[p].x && pos[1] == groups[p].y) {
                            groups[p].join(actionGroup);
                          }
                        }
                        //If the player will move remove one action
                        actionGroup.actions -= 1;
                      }

                      actionGroup.moveTo(pos[0],pos[1], () => {
                        //Attack the enemy after moving
                        if (enemy[0] == true && state.actions > 0) {
                          enemyGroups[enemy[1]].attack(actionGroup, () => {
                            playerAction();
                          });
                        } else {
                            playerAction();
                        }
                      },200)
                    }));
                  }));
                }, limit);
              },
              enemyAction: (callback) => {
                // Force rest
                if (state.members.length <= 0 || state.actions <= 0 || groups.length < 1 || enemyGroups.length < 1) {
                  //resistance boost
                  state.resistance = 1 + state.actions;
                  state.actions = 0;
                  if (callback)
                    callback();

                  return;
                }
                calculateTileLayout();

                closestGroup = groups[0];
                weakestGroup = groups[0];
                distance = pathFind(state.x, state.y, closestGroup.x, closestGroup.y).length;
                // Sort groups in order of distance (no need to test the first group against itself)
                for (let i = 1; i < groups.length; i++) {
                  let testDistance = pathFind(state.x, state.y, groups[i].x, groups[i].y).length;
                  if (testDistance < distance) {
                    // If tested group is closer, set values appropiately
                    closestGroup = groups[i];
                    distance = testDistance;
                  }
                  //Cheak group strength
                  if (groups[i].members.length < weakestGroup.members.length*Math.sqrt(weakestGroup.resistance)) {
                    weakestGroup = groups[i];
                  }
                }

                //If closest group is too strong, head towards the weakest
                if (Math.ceil(closestGroup.members.length/2) >= state.members.length) {
                  closestGroup = weakestGroup;
                  //Guarentee that path doesn't go through other players
                  state.playerTarget = closestGroup;
                  calculateTileLayout(state);
                  state.playerTarget = null;

                  distance = pathFind(state.x, state.y, weakestGroup.x, weakestGroup.y).length;
                }

                // Enemy defaults to pursuit mode, but will retreat if necessary
                // If the player is in range and the enemy is well enough to survive an attack, attack
                if (Math.ceil(state.members.length/Math.sqrt(closestGroup.resistance)) > Math.ceil(closestGroup.members.length / 2) && distance <= 1 && distance > 0) {
                  console.log(distance, state, closestGroup)
                  closestGroup.attack(state, () => {
                    //Cycle back for next action
                    state.enemyAction(callback);
                  })
                }
                // Move towards the player if enemy is in good shape
                else if (Math.ceil(state.members.length/Math.sqrt(closestGroup.resistance)) > Math.ceil(closestGroup.members.length / 2) && Math.ceil(state.members.length/Math.sqrt(closestGroup.resistance)) <= Math.ceil((closestGroup.members.length*3) / 2) && state.members.length <= 25 && distance > 0) {
                  state.playerTarget = closestGroup;
                  calculateTileLayout(state);
                  state.playerTarget = null;

                  let path = pathFind(state.x, state.y, closestGroup.x, closestGroup.y);
                  let safeDest = path[state.range - 1];

                  if (path.length <= state.range) {
                    safeDest = path[path.length - 2];
                  }
                  state.moveTo(safeDest.x, safeDest.y, () => {
                    state.actions -= 1;
                    state.enemyAction(callback);
                  });
                }
                // If enemy is very well off, split the group
                else if (Math.ceil(state.members.length/Math.sqrt(closestGroup.resistance)) > Math.ceil((closestGroup.members.length*3) / 2) && distance > 0) {
                  let path = pathFind(state.x, state.y, closestGroup.x, closestGroup.y);
                  let safeDest = path[state.range - 1];
                  if (path.length <= state.range) {
                    safeDest = path[path.length - 2];
                  }

                  // Move the new group to edge of range towards player group
                  let newGroup = state.split(closestGroup.members.length);
                  newGroup.moveTo(safeDest.x, safeDest.y, () => {
                    newGroup.actions -= 1;
                    state.enemyAction(callback);
                  });
                }
                // If the enemy is too weak attempt to retreat and join with an ally
                else if (enemyGroups.length > 1 && state.members.length <= 25) {
                  closestEnemy = null;
                  enemyDistance = null;
                  calculateTileLayout(state);
                  // Sort groups in order of distance (no need to test the first group against itself)
                  for (let i = 0; i < enemyGroups.length; i++) {
                    let testDistance = pathFind(state.x, state.y, enemyGroups[i].x, enemyGroups[i].y).length;
                    if (testDistance > 0) {
                      if (enemyDistance == null || testDistance < enemyDistance) {
                        // If tested group is closer, set values appropiately
                        closestEnemy = enemyGroups[i];
                        enemyDistance = testDistance;
                      }
                    }
                  }

                  //If no enemies nearby just rest
                  if (closestEnemy == null) {
                    state.resistance = 1 + state.actions;
                    state.actions = 0;
                    if (callback)
                      callback();
                  } //If enemy is close enough, join it
                  else if (enemyDistance <= state.range) {
                    state.moveTo(closestEnemy.x, closestEnemy.y, () => {
                      closestEnemy.join(state, () => {
                        // Enemy is gone, no need to continue its turn
                        if (callback)
                          callback();
                      });
                    });
                  } else {
                    // Otherwise, just move closer to it
                    let enemyPath = pathFind(state.x, state.y, closestEnemy.x, closestEnemy.y);
                    state.moveTo(enemyPath[state.range - 1].x, enemyPath[state.range - 1].y, () => {
                      state.actions -= 1;
                      state.enemyAction(callback);
                    });
                  }
                }
                // If there are no more enemy groups then this poor enemy can do nothing but sacrifice itself for the greater good
                else {
                  if (state.members.length <= 25 && distance <= 1) {
                    closestGroup.attack(state, () => {
                      //Cycle back for next action
                      state.enemyAction(callback);
                    })
                  } else {
                    state.resistance = 1 + state.actions;
                    // Just wait if group is too big
                    state.actions = 0;
                    if (callback)
                      callback();
                  }
                }
              },
          });

          /* Enemy status */
          if (enemy) {
              state.enemy = enemy;
              state.zIndex = 2;
          }

          return state;
      };

      const List = (x,y,group,skip,attackMode,callBack) => {
          let state = Object.assign(
            GameObject(x,y),
            {
              zIndex: 99,
              items: ["Split","Move"],
              active: null,
              group,
              inactive: [0,0,0,0,0],
              draw: () => {
                state.update();
                //List has been removed, do not draw it
                if (state.group == null)
                  return;

                _ctx.beginPath();
                _ctx.fillStyle = COLORS[0];
                _ctx.rect(state.x,state.y,50,70);
                _ctx.fill();
                if (state.active != -1 && state.inactive[state.active] == 0) {
                    _ctx.beginPath();
                    _ctx.fillStyle = COLORS[1];
                    _ctx.rect(state.x,state.y + state.active*(70/state.items.length),50,70/state.items.length);
                    _ctx.fill();
                }
                _ctx.fillStyle = COLORS[3];
                _ctx.font = "bold 11px Arial"
                for (let i=0;i<state.items.length;i++) {
                    if (state.inactive[i] == 1) {
                       _ctx.fillStyle = COLORS[1];
                    }
                    _ctx.fillText(state.items[i],state.x + 2,state.y + (70/state.items.length) * i + 11);
                    if (state.inactive[i] == 1) {
                       _ctx.fillStyle = COLORS[3];
                    }
                }
              },
              update: () => {
                if (groups.length > 1 || skip == true) {
                    remove(state);
                    state.group = null;
                    callBack("Move");
                }
                //Highlight hovered item
                if (mouse.x > state.x && mouse.x < state.x + 50 && mouse.y > state.y && mouse.y < state.y + 70) {
                    state.active = Math.floor((mouse.y - state.y) / (70/state.items.length));
                } else {
                    state.active = -1;
                }

                if (mouse.up) {
                    //Detect which List item to select (for mobile)
                    if (mouse.x > state.x && mouse.x < state.x + 50 && mouse.y > state.y && mouse.y < state.y + 70) {
                        state.active = Math.floor((mouse.y - state.y) / (70/state.items.length));
                    } else {
                        state.active = -1;
                    }

                    mouse.up = false;
                    if (state.inactive[state.active] == 0) {
                        //Disable player after making selection
                        remove(state);
                        enablePlayer = false;
                        callBack(state.items[state.active]);
                    }
                    /* List is removed whether action occurs or not
                    Unless it is an inactive item
                    */
                    if (state.active == -1) {
                        remove(state);
                        playerAction();
                    }
                }
              }
            }
          );

          /* If list is off screen, move it */
          if (state.x + 50 > 240) {
              state.x -= 30;
          }
          if (state.y + 70 > 240) {
              state.y -= 50;
          }

          let distance = null;
          let target = 0;
          /* disable attack if no enemies are nearby */
          for (let i=0; i < enemyGroups.length; i++) {
              if (distance == null) {
                distance = Math.sqrt(Math.pow(enemyGroups[i].x - group.x,2)+Math.pow(enemyGroups[i].y - group.y,2));
              } else if (Math.sqrt(Math.pow(enemyGroups[i].x - group.x,2)+Math.pow(enemyGroups[i].y - group.y,2)) < distance) {
                distance = Math.sqrt(Math.pow(enemyGroups[i].x - group.x,2)+Math.pow(enemyGroups[i].y - group.y,2));
              }
          }
          /* Change split to rejoin */
          if (groups.length > 1)
              state.items[0] = "Join";
          /* Disable move,split, and build if group is blocked off */
          calculateTileLayout();
          if (tileCheck(group.x,group.y+1) !== 1 && tileCheck(group.x,group.y-1) !== 1 && tileCheck(group.x+1,group.y) !== 1 && tileCheck(group.x-1,group.y) !== 1) {
              state.inactive[0] = 1;
              /*state.inactive[1] = 1;
              state.inactive[2] = 1;*/
          }

          /*Change move to attack if attacking*/
          if (attackMode == true) {
            state.items[1] = "Attack";
          }

          /* Disable moving if the group is too big */
          if (group.members.length > 25) {
            state.inactive[1] = 1;
          }

          return state;
      };

      //dialogue box set to appear the bottom of the screen, is clicked activated.
      const DialogueBox = () => {
        let state = Object.assign(
          GameObject(0,0),
          {
            textSegments: [],
            currentSegment: -1,
            topText: "",
            bottomText: "",
            zIndex: 101,
            textYOffset: 0,
            scrolling: true,
            callback: null,
            start: (text, callback) => {
              add(state);
              menuActive = true;
              //reset variables
              state.topText = "";
              state.bottomText = "";
              state.y = HEIGHT/2;
              //Set-up callback
              if (callback) {
                state.callback = callback
              } else {
                state.callback = null;
              }
              animate(state, "y", HEIGHT/2 - 80, {time: 200, callback: () => {
                state.textSegments = text.split("~");
                state.currentSegment = 0;
                state.scrollText();
              }});
            },
            draw: () => {
              state.update();

              //Box BG
              _ctx.beginPath();
              _ctx.fillStyle = COLORS[3];
              _ctx.strokeStyle = COLORS[0];
              _ctx.lineWidth = 4;
              _ctx.rect(2, state.y, WIDTH / 2 - 4, 78);
              _ctx.fill();
              _ctx.stroke();

              //Draw the text in a clipped region
              _ctx.save();
              _ctx.clip();
              _ctx.fillStyle = COLORS[0];
              _ctx.align = "left";
              _ctx.font = "20px Arial Black";
              _ctx.fillText(state.topText, 10, state.y + 30 + state.textYOffset);
              _ctx.fillText(state.bottomText, 10, state.y + 60 + state.textYOffset);
              //Restore clipped region
              _ctx.restore();
            },
            scrollText: (index) => {
              state.scrolling = true;

              if (index == undefined)
                index = 1;

              add(Timer(15, () => {
                if (state.currentSegment % 2 == 0) {
                  state.topText = state.textSegments[state.currentSegment].substring(0, index);
                  //If the index is less than the length of the string, keep going
                  if (index < state.textSegments[state.currentSegment].length) {
                    state.scrollText(index + 1);
                  } else {
                    //Check if there are more text segments to scroll, if so, increment the currentSegment
                    if (state.currentSegment < state.textSegments.length - 1) {
                      state.currentSegment++;
                      state.scrollText(0);
                    } else {
                      state.scrolling = false;
                      //Nothing else to do
                      return;
                    }
                  }
                } else {
                  state.bottomText = state.textSegments[state.currentSegment].substring(0, index);
                  if (index < state.textSegments[state.currentSegment].length) {
                    state.scrollText(index + 1);
                  } else {
                    state.scrolling = false;
                    //Do not automatically move on to the next segment
                    return;
                  }
                }
              }))
            },
            update: () => {
              if (mouse.click && state.scrolling == false && state.currentSegment < state.textSegments.length - 1) {
                state.scrolling = true;
                animate(state, "textYOffset", -80, {time: 300, callback: () => {
                  state.textYOffset = 0;
                  state.topText = "";
                  state.bottomText = "";
                  state.currentSegment += 1;
                  state.scrollText();
                }});
              } else if (mouse.click && state.scrolling == false) {
                //Close the box
                state.scrolling = true;
                animate(state, "y", WIDTH/2, {time: 200, callback: () => {
                  //Set everything back the way it should be
                  remove(state);
                  menuActive = false;
                  if (state.callback) {
                    state.callback();
                  }
                }});
              }
            }
          }
        );

        return state;
      }

      const Message = (text,y,length,callBack) => {
          let state = Object.assign(
            GameObject(0,y),
            {
              zIndex: 101,
              text,
              length: -1,
              height: 0,
              step: 1,
              init: () => {
                message = true;
                add(Timer(250,() => {
                  state.step = 2;
                  if (state.length < 0) {
                    /* This message is click triggered */
                    return;
                  }
                  add(Timer(state.length, () => {
                    if (state.height >= 50 || state.y <= y - 25) {
                      state.y = y - 25;
                      state.height = 50;
                    }
                    state.close();
                  }));
                }, () => {
                  /* Step 1 Progress*/
                  state.height += (50/15)*deltaTime;
                  state.y -= (25/15)*deltaTime;
                  if (state.height >= 50 || state.y <= y - 25) {
                    state.y = y - 25;
                    state.height = 50;
                  }
                }));
              },
              close: () => {
                state.step = 3;
                add(Timer(250, () => {
                  /* Finish */
                  message = false;
                  remove(state);
                  state.draw = null;
                  if (callBack)
                      callBack();
                }, () => {
                  /* Step 3 progress */
                  state.height -= (50/15)*deltaTime;
                  state.y += (25/15)*deltaTime;
                  if (state.height <= 0 || state.y > y) {
                    state.y = y;
                    state.height = 0;
                  }
                }));
              },
              draw: () => {
                message = true;
                _ctx.fillStyle = COLORS[0];
                _ctx.beginPath();
                _ctx.rect(0,state.y,240,state.height);
                _ctx.fill();
                if (state.step == 2) {
                    _ctx.fillStyle = COLORS[3];
                    _ctx.font = "bold 24px Arial"
                    _ctx.fillText(state.text,10,state.y + 35);
                    if (state.length < 0 && mouse.click)
                      state.close();
                }
              },
            }
          );

          /* How long should the message appear for */
          if (length)
              state.length = length;

          /* Start timer */
          state.init();

          return state;
      };

      /* Simple timer */
      const Timer = (time,callBack,progress) => {
        let state = Object.assign(
          GameObject(0,0),
          {
            time: Date.now() + time,
            disable: false,
            draw: () => {
              /* If progress callBack */
              if (Date.now() >= state.time && state.disable == false) {
                remove(state);
                state.disable = true;
                if (callBack)
                  callBack();
              }
              if (progress && state.disable == false)
                progress();
            }
          }
        );
        return state;
      };

      /* The target sprite (targets any sprite for a specified time) */
      const Target = (sprite,time,callBack, offset) => {
        let state = Object.assign(
          GameObject(sprite.x,sprite.y),
          {
            zIndex: 100,
            alpha: 0,
            offset: {x: 0, y: 0},
            draw: () => {
              _ctx.globalAlpha = state.alpha;
              /* Draw target around sprite */
              _ctx.drawImage(graphics,16*6,16,16,16,sprite.x*TILEWIDTH + 1 + state.offset.x,sprite.y*TILEHEIGHT + 14 + state.offset.y,16,16);
              _ctx.drawImage(graphics,0,16*2,16,16,sprite.x*TILEWIDTH + 31 + state.offset.x,sprite.y*TILEHEIGHT + 14 + state.offset.y,16,16);
              _ctx.drawImage(graphics,16,16*2,16,16,sprite.x*TILEWIDTH + 31 + state.offset.x,sprite.y*TILEHEIGHT + 44 + state.offset.y,16,16);
              _ctx.drawImage(graphics,16*2,16*2,16,16,sprite.x*TILEWIDTH + 1 + state.offset.x,sprite.y*TILEHEIGHT + 44 + state.offset.y,16,16);

              _ctx.globalAlpha = 1;
            },
            update: () => {

            },
            init: () => {
              if (offset)
                state.offset = offset;
              state.fade(time/8,1);
              add(Timer(time/4,() => {
                state.fade(time/4,0);
                add(Timer(time/4,() => {
                  state.fade(time/8,1);
                  add(Timer(time/4,() => {
                    state.fade(time/4,0);
                    add(Timer(time/4,() => {
                      remove(state);
                      if (callBack)
                        callBack();
                    }));
                  }));
                }));
              }));
            }
          }
        );
        state.init();

        return state;
      }

      /* Tile select */
      const TileSelect = () => {
        let state = Object.assign(
          GameObject(0,0),
          {
            tiles: [],
            callBack: null,
            alphaSpeed: .01,
            open: false,
            start: (x,y,range,callBack,player) => {
              state.open = true;
              if (callBack) {
                state.callBack = callBack;
              } else {
                state.callBack = null;
              }
              add(state);
              state.tiles = [];
              state.calculateTiles(x,y,range);
              state.tiles = uniq_fast(state.tiles);
              /* Check the layout of the grid */
              calculateTileLayout(player);
              for (let i=0;i<state.tiles.length;i++) {
                if (state.tiles[i][0] > 4 || state.tiles[i][1] > 4) {
                  state.tiles.splice(i,1);
                  i--;
                } else if (tileCheck(state.tiles[i][0],state.tiles[i][1]) != 1) {
                  state.tiles.splice(i,1);
                  i--;
                }
              }
            },
            calculateTiles: (x,y,range) => {
              if (range == 0) {
                state.tiles.push([x,y]);
                return;
              }
              //Only consider tiles that the player could travel to
              if (x >= 0 && x < 5 && y >= 0 && y < 5 && levelData[mission][level].data[y][x] <= 5) {
                state.tiles.push([x,y]);
                state.calculateTiles(x-1,y,range-1);
                state.calculateTiles(x+1,y,range-1);
                state.calculateTiles(x,y+1,range-1);
                state.calculateTiles(x,y-1,range-1);
              } else {
                return;
              }
            },
            draw: () => {
              state.update();
              /* Fade effect */
              state.alpha += state.alphaSpeed*deltaTime;
              if (state.alpha < .4) {
                state.alpha = .4;
                state.alphaSpeed = -state.alphaSpeed;
              } else if (state.alpha > .8) {
                state.alpha = .8;
                state.alphaSpeed = -state.alphaSpeed;
              }
              for (let i=0;i<state.tiles.length;i++) {
                _ctx.beginPath();
                _ctx.strokeStyle = COLORS[3];
                _ctx.fillStyle = COLORS[2];
                _ctx.rect(state.tiles[i][0]*TILEWIDTH,state.tiles[i][1]*TILEHEIGHT+14,48,45);
                _ctx.globalAlpha = state.alpha;
                _ctx.fill();
                _ctx.globalAlpha = 1;
                _ctx.stroke();
                //Draw sword above enemy spaces
                for (let e=0; e < enemyGroups.length; e++) {
                  if (state.tiles[i][0] == enemyGroups[e].x && state.tiles[i][1] == enemyGroups[e].y) {
                    enemyGroups[e].attackSelectionFlag = true;
                  }
                }
              }
            },
            update: () => {
              if (mouse.up) {
                for (let i=0; i<state.tiles.length; i++) {
                  if (mouse.x > state.tiles[i][0]*TILEWIDTH && mouse.x < state.tiles[i][0]*TILEWIDTH + TILEWIDTH && mouse.y > state.tiles[i][1]*TILEHEIGHT+14 && mouse.y < state.tiles[i][1]*TILEHEIGHT+14+TILEHEIGHT) {
                    /* Player has clicked on a valid tile */
                    remove(state);
                    state.open = false;
                    mouse.up = false;
                    if (state.callBack)
                      state.callBack(state.tiles[i]);
                  }
                }
              }
            }
          }
        );

        return state;
      }

      const AttackOverlay = (attacker, defender, callBack) => {
        let state = Object.assign(
          GameObject(0,0),
          {
            attackerHealth: attacker.members.length,
            defenderHealth: defender.members.length,
            distanceApart: WIDTH / 4 + 20,
            attackerHeight: 80,
            defenderHeight: 80,
            offset: 0,
            zIndex: 101,
            draw: () => {
              //Attacker
              _ctx.beginPath();
              if (attacker.enemy == true) {
                _ctx.fillStyle = COLORS[0];
              } else {
                _ctx.fillStyle = COLORS[1];
              }
              _ctx.rect(-state.distanceApart, HEIGHT / 4 - state.attackerHeight / 2, WIDTH / 4 - 20 + state.offset, state.attackerHeight);
              _ctx.moveTo(state.offset + WIDTH / 4 - 20 - state.distanceApart, HEIGHT / 4 - state.attackerHeight / 2);
              _ctx.lineTo(state.offset + WIDTH / 4 + 20 - state.distanceApart, HEIGHT / 4 - state.attackerHeight / 2);
              _ctx.lineTo(state.offset + WIDTH / 4 - 20 - state.distanceApart, HEIGHT / 4 + state.attackerHeight / 2);
              _ctx.fill();
              _ctx.fillStyle = COLORS[3];
              _ctx.font = "bold 32px Arial"
              _ctx.textAlign = "right";
              _ctx.fillText(state.attackerHealth, state.offset-state.distanceApart + WIDTH / 4 - 20, HEIGHT / 4 - state.attackerHeight + 70)
              _ctx.font = "bold 24px Arial"
              _ctx.textAlign = "left";
              if (attacker.enemy == true) {
                _ctx.fillText("ENEMY", state.offset-state.distanceApart, HEIGHT / 4 + state.attackerHeight / 2);
              } else {
                _ctx.fillText("PLAYER", state.offset-state.distanceApart, HEIGHT / 4 + state.attackerHeight / 2);
              }
              //defender
              _ctx.beginPath();
              if (defender.enemy == true) {
                _ctx.fillStyle = COLORS[0];
              } else {
                _ctx.fillStyle = COLORS[1];
              }
              _ctx.rect(state.offset + WIDTH / 4 + 20 + state.distanceApart, HEIGHT / 4 - state.defenderHeight / 2, WIDTH / 4 - 20 - state.offset, state.defenderHeight);
              _ctx.moveTo(state.offset + WIDTH / 4 + 20 + state.distanceApart, HEIGHT / 4 - state.defenderHeight / 2);
              _ctx.lineTo(state.offset + WIDTH / 4 - 20  + state.distanceApart, HEIGHT / 4 + state.defenderHeight / 2);
              _ctx.lineTo(state.offset + WIDTH / 4 + 20  + state.distanceApart, HEIGHT / 4 + state.defenderHeight / 2);
              _ctx.fill();
              _ctx.fillStyle = COLORS[3];
              _ctx.font = "bold 32px Arial"
              _ctx.textAlign = "left";
              _ctx.fillText(state.defenderHealth, state.offset+state.distanceApart + WIDTH / 4 + 20, HEIGHT / 4 + state.attackerHeight - 50)
              _ctx.font = "bold 24px Arial"
              _ctx.textAlign = "right";
              if (defender.enemy == true) {
                _ctx.fillText("ENEMY", state.offset+state.distanceApart + WIDTH / 2, HEIGHT / 4 - state.attackerHeight / 2 + 20);
              } else {
                _ctx.fillText("PLAYER", state.offset+state.distanceApart + WIDTH / 2, HEIGHT / 4 - state.attackerHeight / 2 + 20);
              }
            },
            attackerAttacks: () => {
              state.defenderHealth -= Math.ceil(state.attackerHealth/Math.sqrt(defender.resistance));
              if (state.defenderHealth <= 0) {
                state.defenderHealth = 0;
                add(Timer(600, () => {
                  state.offset = (WIDTH + 20);
                  state.attackerHeight = 0;
                  state.defenderHeight = 0;
                  //Battle is over
                  remove(state);
                  callBack();
                }, () => {
                  state.offset += (WIDTH + 20) / (60/2.5);
                  state.attackerHeight -= 80/(60/2.5);
                  state.defenderHeight -= 80/(60/2.5);
                  if (state.attackerHeight < 0 || state.defenderHeight < 0) {
                    state.attackerHeight = 0;
                    state.defenderHeight = 0;
                  }
                }))
              } else {
                add(Timer(200, () => {
                  state.offset = 50;
                  add(Timer(100, () => {
                    //Once the attacker is finished let the defender attack
                    state.defenderAttacks();
                  }))
                }, () => {
                  state.offset += 50 / (60/5);
                }))
              }
            },
            defenderAttacks: () => {
              state.attackerHealth -= Math.ceil(state.defenderHealth);
              if (state.attackerHealth <= 0) {
                state.attackerHealth = 0;
                add(Timer(400, () => {
                  state.offset = -(WIDTH + 20);
                  state.attackerHeight = 0;
                  state.defenderHeight = 0;
                  //Battle is over
                  remove(state);
                  callBack();
                }, () => {
                  state.offset -= (WIDTH + 20) / (60/2.5);
                  state.attackerHeight -= 80/(60/2.5);
                  state.defenderHeight -= 80/(60/2.5);
                  if (state.attackerHeight < 0 || state.defenderHeight < 0) {
                    state.attackerHeight = 0;
                    state.defenderHeight = 0;
                  }
                }))
              } else {
                add(Timer(200, () => {
                  state.offset = -50;
                  //Battle is over
                  add(Timer(100, () => {
                    state.close();
                  }))
                }, () => {
                  state.offset -= 100 / (60/5);
                }))
              }
            },
            close: () => {
              add(Timer(200, () => {
                remove(state);
                callBack();
              }, () => {
                state.distanceApart += 20;
              }));
            },
          }
        );

        //Bring the sides together
        animate(state, "distanceApart", 0, {time: 100, callback: () => {
          startFX(FLASH,{complete: () => {
            add(Timer(400, () => {
              state.attackerAttacks();
            }));
          }, time: 20, color: COLORS[3]});
        }});

        return state;
      }

      const LevelPreview = () => {
        let state = Object.assign(
          GameObject(0, 0),
          {
            animationPercent: 0,
            draw: () => {
              //Background color
              _ctx.beginPath();
              _ctx.fillStyle = COLORS[0];
              _ctx.rect(0, 0, WIDTH, HEIGHT);
              _ctx.fill();

              // Name of Stage
              _ctx.globalAlpha = state.animationPercent;
              _ctx.fillStyle = COLORS[3];
              _ctx.font = "28px Arial Black";
              _ctx.textAlign = "center";
              _ctx.fillText(levelData[mission][level].name, WIDTH/4, 100 - 5*state.animationPercent);
              _ctx.globalAlpha = 1;

              // Bar
              _ctx.beginPath();
              _ctx.rect(WIDTH / 4 - 100*state.animationPercent, 110, 200*state.animationPercent, 3);
              _ctx.fill();
            }
          }
        );

        // Animate
        add(Timer(200,() => {
          animate(state, "animationPercent", 1, {timer: 2000, callback: () => {
            add(Timer(1000, () => {
              startFX(FADE,{complete: beginLevel, time: 20});
              animate(state, "animationPercent", 0, {timer: 750});
            }));
          }});
        }))

        return state;
      }

      function pushGroup(x,y,enemy) {
          let newGroup = add(Group(x, y,enemy));
          if (enemy == true) {
              enemyGroups.push(newGroup);
          } else {
              groups.push(newGroup);
              newGroup.group = String.fromCharCode(65 + groups.length-1);
          }
          return newGroup;
      }

      // Basic animation function
      function animate(object, valueName, endValue, options) {
        let time = 1000;
        if (options.time) {
          time = options.time;
        }

        let initalValue = object[valueName];
        let increment = (endValue - initalValue) / ((time/1000)*60);
        let overflow = 0;
        if (initalValue > endValue) {
          overflow = 1;
        }

        add(Timer(time, () => {
          //Finish animation
          object[valueName] = endValue;

          //If there's a callback, do it
          if (options.callback) {
            options.callback();
          }
        }, () => {
          object[valueName] += increment;
          if (overflow == 0 && object[valueName] > endValue) {
            object[valueName] = endValue;
          } else if (overflow == 1 && object[valueName] < endValue) {
            object[valueName] = endValue;
          }
        }))
      }

      function add(obj,last) {
          obj.ID = objId++;
          objects.push(obj);
          return obj;
      }

      function remove(obj) {
          if (obj.ID != null)
              for (let i=0;i<objects.length;i++) {
                  if (obj.ID == objects[i].ID) {
                      objects.splice(i,1);
                      obj.ID = null;
                      draw();
                      return obj;
                  }
              }
          return null;
      }

      /*Game Start Code*/
      function gameStart() {
          _tileSelector = TileSelect();
          _dialogueBox = DialogueBox();
          mission = 1;
          startFX(FLASH,{color: "#FFF275"})
          switchState(MENU_STATE);
      }

      function load() {
        Waud.init();
        //Auto mute audio when inactive
        Waud.autoMute();

        //Mobile unlock
        Waud.enableTouchUnlock();

        loadAudioFiles();
      }

      function checkLoadProgress() {
        //Get length of "sounds" object
        let soundsLength = 0;
        for (let name in sounds)
          soundsLength++;

        //If this is true, all sound files have loaded
        if (soundsLength == AUDIOFILES.length) {
          gameStart();
          gameLoop();
        }
      }

      function switchState(newState) {
          objects = [];
          groups = [];
          enemyGroups = [];
          whichEnemy = 0;
          movingGroup = null;
          attackGroup = null;
          targetedSprite = null;
          message = false;
          buildings = [];
          menuActive = false;
          enablePlayer = false;
          _canvas.style.cursor = "default";
          _tileLayout = [];
          gameState = newState;
          //Disable all audio
          stopAllAudio();

          if (gameState == MENU_STATE) {

            sounds['Title Screen'].play();
          }
          //Draw background
          bgDraw();
      }

      function beginLevel() {
          round = 0;
          switchState(GAME_STATE);
          turn = "player";
          /* Start turn after flash */
          startFX(FLASH,{complete: () => {
              if (gameState == GAME_STATE)
                  turnSwitch(true);
          }, time: 20});
          //Spawn player and enemy groups
          for (let p = 0; p < levelData[mission][level].groups.length; p++) {
            if (levelData[mission][level].groups[p].units) {
              shuffleGroup(createTroops(levelData[mission][level].groups[p].units,0,0,pushGroup(levelData[mission][level].groups[p].x, levelData[mission][level].groups[p].y)),12)
            } else {
              // If in a mission, carry unit count from previous stage. Add reinforcements
              shuffleGroup(createTroops(unitStorage + levelData[mission][level].reinforcements,0,0,pushGroup(levelData[mission][level].groups[p].x, levelData[mission][level].groups[p].y)),12)
            }
          }

          for (let p = 0; p < levelData[mission][level].enemies.length; p++) {
            shuffleGroup(createTroops(levelData[mission][level].enemies[p].units,0,0,pushGroup(levelData[mission][level].enemies[p].x, levelData[mission][level].enemies[p].y, true)),12)
          }
      }
      /*
        Event types:
        Dialogue: Pops up a dialogue box
        Target: Targets a tile on screen
        Limit: Limits the actions of the player
      */
      function parseRoundEvents(eventsArr, callback) {
        //All events have been completed
        if (eventsArr.length == 0) {
          if (callback)
            callback();

          return;
        }
        if (eventsArr[0].type == "dialogue") {
          _dialogueBox.start(eventsArr[0].data, () => {
            //Dialogue is finished
            eventsArr.shift();
            parseRoundEvents(eventsArr, callback);
          });
        } else if (eventsArr[0].type == "target") {
          let pos = eventsArr[0].data;
          targetSprite(GameObject(pos[0], pos[1]), 1000, () => {
            //Targeting complete
            eventsArr.shift();
            parseRoundEvents(eventsArr, callback);
          })
        } else if (eventsArr[0].type == "limit") {
          actionLimit = eventsArr[0].data;
          eventsArr.shift();
          parseRoundEvents(eventsArr, callback);
        }
      }

      function loadAudioFiles(index) {
        if (!index)
          index = 0;

        let audio = new WaudSound(AUDIOFILES[index].src, {
          loop: AUDIOFILES[index].loop,
          onload: () => {
            sounds[AUDIOFILES[index].name] = audio;
            index++;
            if (index == AUDIOFILES.length) {
              //Done loading
              checkLoadProgress();
            } else {
              loadAudioFiles(index);
            }
          }
        });
      }

      function stopAllAudio() {
        for (let title in sounds) {
            sounds[title].stop();
        }
      }

      function turnSwitch(player) {
          if (player == true) {
              //Start of a new round
              round++;
              //Reset actionlimits
              actionLimit = null;

              turn = "player";
              //Check for events
              let roundEvents = [];
              if (levelData[mission][level].events) {
                for (let i = 0; i < levelData[mission][level].events.length; i++) {
                  if (levelData[mission][level].events[i].round == round) {
                    roundEvents.push(levelData[mission][level].events[i]);
                  }
                }
              }
              parseRoundEvents(roundEvents, () => {
                add(Message("PLAYER TURN",120,750, playerAction));
              })
              /* Reset all groups */
              for (let i=0;i<groups.length;i++) {
                  if (groups[i]) {
                    groups[i].actions = 3;
                    //resistance is lost after 1 turn
                    groups[i].resistance = 1;
                  }
              }
              calculateTileLayout();
          } else {
              whichEnemy = 0;
              turn = "enemy";
              add(Message("ENEMY TURN",120,750,enemyActions));
              for (let i=0;i<enemyGroups.length;i++) {
                  if (enemyGroups[i]) {
                    enemyGroups[i].actions = 3;
                    //Resistance is lost after 1 turn
                    enemyGroups[i].resistance = 1;
                  }
              }
          }
      }

      function createTroops(num,x,y,group) {
          for (let i=0;i<num;i++) {
              if (group.enemy == true) {
                  group.members.push(Troop(x,y,6));
              } else {
                  group.members.push(Troop(x,y,Math.floor(Math.random() * 6)));
              }
          }
          return group;
      }

      /* Fun extra visual function (can be cut for more space) */
      function shuffleGroup(group,magnitude) {
          for (let i=0;i<group.members.length;i++) {
              group.members[i].goto = [Math.random() * (magnitude*2) - magnitude,Math.random() * (magnitude*2) - magnitude]
          }
          return group;
      }

      /* Visual flare to indicate that sprite is active */
      function targetSprite(obj, time, callBack, offset) {
        add(Target(obj,time,callBack, offset));
      }

      /*Return the value of a tile space */
      function tileCheck(x,y) {
        if (x >= 0 && x < 5 && y >= 0 && y < 5) {
            return _tileLayout[x][y];
        } else {
            return null;
        }
      }

      function calculateTileLayout(player) {
        for (let i = 0; i < 5; i++) {
          _tileLayout[i] = [];
          for (let j = 0; j < 5; j++) {
            _tileLayout[i][j] = 1;
          }
        }
        for (let i = 0; i < groups.length; i++) {
            //Enemies will only see the player they are targeting, others will be invisible
            if (player && player.enemy == true && player.playerTarget == groups[i]) {
              _tileLayout[groups[i].x][groups[i].y] = 1;
            } else if (player && player.enemy == true) {
              _tileLayout[groups[i].x][groups[i].y] = 0;
            } else {
              _tileLayout[groups[i].x][groups[i].y] = 1;
            }
        }
        for (let i = 0; i < enemyGroups.length; i++) {
          //Enemies usually see other enemies for joining (however, not when targeting players)
          if (player && player.enemy == true && player.playerTarget != null) {
            _tileLayout[enemyGroups[i].x][enemyGroups[i].y] = 0;
          } else if (player && player.enemy == true) {
            _tileLayout[enemyGroups[i].x][enemyGroups[i].y] = 1;
          //Enemies shouldn't be visible to players who can't attack them
          } else if (player && player.actions > 1) {
            _tileLayout[enemyGroups[i].x][enemyGroups[i].y] = 1;
          } else if (player && player.actions == 1 && Math.sqrt(Math.pow(enemyGroups[i].x - player.x, 2) + Math.pow(enemyGroups[i].y - player.y, 2)) <= 1) {
            _tileLayout[enemyGroups[i].x][enemyGroups[i].y] = 1;
          } else {
            _tileLayout[enemyGroups[i].x][enemyGroups[i].y] = 0;
          }
        }
        for (let i = 0; i < buildings.length; i++) {
          _tileLayout[buildings[i].tile[0]][buildings[i].tile[1]] = 0;
        }
        //For collision tiles
        for (var r=0;r<5;r++) {
            for (var c=0;c<5;c++) {
                if (levelData[mission][level].data[r][c] > 5) {
                    _tileLayout[c][r] = 0;
                }
            }
        }
      }

      function pathFind(x1,y1,x2,y2) {
        let graph = new Graph(_tileLayout);
        let start = graph.grid[x1][y1];
        let end = graph.grid[x2][y2];
        return astar.search(graph, start, end);
      }

      function sortObjects() {
          /* Sort buildings */
          let error = false;
          if (buildings)
            do {
                error = false;
                for (let i=0;i<buildings.length-1;i++) {
                    if (buildings[i].y < buildings[i+1].y) {
                        let temp = buildings[i];
                        buildings[i] = buildings[i+1];
                        buildings[i+1] = temp;
                        error = true;
                    }
                    buildings[i].zIndex = 1 - i/10;
                }
            } while (error == true);

          /* Sort every other sprite */
          do {
              error = false;
              for (let i=0;i<objects.length-1;i++) {
                  if (objects[i].zIndex > objects[i+1].zIndex) {
                      let temp = objects[i];
                      objects[i] = objects[i+1];
                      objects[i+1] = temp;
                      error = true;
                  }
              }
          } while (error == true);
      }

      /* return an array with all unique values */
      function uniq_fast(a) {
          let seen = {};
          let out = [];
          let len = a.length;
          let j = 0;
          for(let i = 0; i < len; i++) {
               let item = a[i];
               if(seen[item] !== 1) {
                     seen[item] = 1;
                     out[j++] = item;
               }
          }
          return out;
      }

      function gameLoop() {
        requestAnimationFrame(gameLoop);

        /* Calculate Deltatime */
        deltaTime = (Date.now() - _lastTime)/(1000/60);
        _lastTime = Date.now();

        /* STATE MANAGER */
        if (gameState == GAME_STATE) {
            if (turn == "enemy") {
                mouse.click = false;
            } else if (turn == "player") {
                //Nothing
            } else if (turn == "buildings") {
                mouse.click = false;
            }
        } else if (gameState == MENU_STATE) {
            menuUpdate();
        }

        /* Draw Function */
        draw();

        /*Release mouse click event*/
        mouse.click = false;
        mouse.up = false;
      }

      function draw() {
          sortObjects();
          _ctx.clearRect(0,0,480,480);
          //Draw background
          _ctx.drawImage(_bgCanvas,0,0,240,240);
          /*Sprites*/
          for (let i=0;i<objects.length;i++) {
              objects[i].draw();
          }

          /*Game State specific stuff */
          if (gameState == GAME_STATE) {
              /* HUD */
              _ctx.fillStyle = COLORS[1];
              _ctx.strokeStyle = COLORS[0];
              _ctx.lineWidth = 2;
              _ctx.beginPath();
              _ctx.rect(-2,-2,244,15);
              _ctx.fill();
              _ctx.stroke();
              _ctx.textAlign = "center";
              let txt;
              if (movingGroup == true) {
                  txt = "Moving Group";
              } else if (attackGroup != null) {
                  txt = "Select Enemy Group to Attack"
              } else if (turn == "player" || turn == "buildings") {
                  txt = "Player's Turn";
              } else if (turn == "enemy") {
                  txt = "Enemy's Turn";
              } else {
                  txt = "";
              }
              _ctx.font = "bold 8px Arial";
              _ctx.fillStyle = COLORS[3];
              _ctx.fillText(txt,120,9);
              _ctx.textAlign = "left";
          } else if (gameState == MENU_STATE) {
              /*Sine wave*/
              let flag = {x: 25, y: 90,period: 1.5,size: 50,width:80,wave: 5};
              flag.y = flag.y - flag.wave*Math.sin((((sineOffset)/flag.width-1)*(Math.PI*2))/flag.period);
              _ctx.beginPath();
              _ctx.fillStyle = COLORS[3];
              for (let s=0;s<2;s++) {
                  if (s==0)
                      _ctx.moveTo(flag.x,(flag.y + s*flag.size)+flag.wave*Math.sin((((sineOffset)/flag.width-1)*(Math.PI*2))/flag.period));
                  else if (s==1)
                      _ctx.lineTo(flag.x+flag.width-1,flag.y+flag.size + flag.wave*Math.sin((((sineOffset+flag.width-1)/flag.width-1)*(Math.PI*2))/flag.period));
                  for (let i=0;i<flag.width;i++) {
                      if (s==0)
                          _ctx.lineTo(flag.x+i,(flag.y + s*flag.size)+flag.wave*Math.sin((((i+sineOffset)/flag.width-1)*(Math.PI*2))/flag.period));
                      if (s==1)
                          _ctx.lineTo(flag.x+flag.width-1-i,(flag.y + s*flag.size)+flag.wave*Math.sin((((flag.width-i+sineOffset)/flag.width-1)*(Math.PI*2))/flag.period));
                  }
              }
              _ctx.closePath();
              _ctx.fill();
              sineOffset -= deltaTime;
          }

          /* If fx are active then draw them */
          if (fx != {}) {
              fxDraw();
          }
      }

      /* Run this function if all the player groups die */
      function gameOver() {
          turn = "gameOver";
          add(Message("GAME OVER!",120,-1, () => {
              startFX(FADE,{complete: () => {
                switchState(MENU_STATE);
                bgDraw();
                startFX(FLASH,{time: 20});
              }, time: 20});
          }));
      }

      function win() {
          unitStorage = 0;
          // Add up the units of all player groups
          for (let i = 0; i < groups.length; i++) {
            unitStorage += groups[i].members.length;
          }
          turn = "win";
          if (level == levelData[mission].length - 1) {
            //End of mission
            mission++;
            level = 0;
          } else {
            //End of stage
            level++;
          }
          add(Message("STAGE CLEAR",120,-1, () => {
              startFX(FADE,{complete: () => {
                if (mission < levelData.length) {
                  switchState(PRESTAGE_STATE);
                  add(LevelPreview());
                } else {
                  switchState(END_STATE);
                }
              }, time: 20});
          }));
      }

      /* Call once to enable player actions */
      function playerAction() {
        /* Check if player groups are still alive */
        let alive = false;
        for (let i=0;i<groups.length;i++) {
            if (groups[i] != null)
                alive = true
        }
        if (alive == false) {
            gameOver();
            return;
        }
        /* Check if enemy groups are still alive */
        alive = false;
        for (let i=0;i<enemyGroups.length;i++) {
            if (enemyGroups[i] != null)
                alive = true
        }
        if (alive == false) {
            win();
            return;
        }
        /* End turn when all actions are used up */
        if (groups && turn == "player")
            if (groups.length > 0 && enemyGroups.length > 0) {
                let totalActions = 0;
                for (let i=0;i<groups.length;i++)
                    if (groups[i])
                        totalActions += groups[i].actions;
                if (totalActions == 0)
                    turnSwitch(false);
            }

        /* If the player can move the enable them */
        movingGroup = false;
        enablePlayer = true;
      }

      function buildingsActions() {
          if (currentBuilding == buildings.length) {
            /* Once all building actions are complete switch control to player and reset buildings*/
            currentBuilding = 0;
            turn = "player";
            playerAction();
          } else {
            buildings[currentBuilding].action();
            currentBuilding++;
          }
      }

      /* Create for loop to select enemy who has actions left.
      Don't use whichEnemy as a counter! */
      function enemyActions() {
          whichEnemy = 0;
          for (let i=0; i<enemyGroups.length; i++) {
            if (enemyGroups[i].actions > 0) {
              whichEnemy = i;
              break;
            }
          }
          targetSprite(enemyGroups[whichEnemy],1000,() => {
            enemyGroups[whichEnemy].enemyAction(() => {
              whichEnemy++;

              /* Check to see if there are any players still standing */
              if (groups.length == 0) {
                  gameOver();
                  return;
              }

              /* Check if enemy groups are still alive */
              if (enemyGroups.length == 0) {
                  win();
                  return;
              }

              for (let i=0; i<enemyGroups.length; i++) {
                if (enemyGroups[i].actions > 0) {
                  enemyActions()
                  return;
                }
              }
              /* end turn if no more enemies can move */
              whichEnemy = 0;
              turnSwitch(true);
          });
        });
      }

      /* Update logic for the main menu */
      function menuUpdate() {
          /* Click the start button */
          if (mouse.x > 165 -52 && mouse.x < 165+52 && mouse.y > 168 && mouse.y < 202) {
              _canvas.style.cursor = "pointer";
              if (mouse.click && !fx.type) {
                  level = 0;
                  startFX(CIRCLE_TRANSITION,{complete: () => {
                    switchState(PRESTAGE_STATE);
                    add(LevelPreview());
                  }});
                  _canvas.style.cursor = "default";
              }
          } else {
              _canvas.style.cursor = "default";
          }
      }

      /*
          Types and Options:
          1) Circle Transition:
              - Speed
              - Density
              - Complete
          2) Fade
              - Color
              - Time
              - Complete
          3) Flash
              - Color
              - Time
              - Complete
      */
      function startFX(type,options) {
          fx = {type: type, options: options};
          if (type == CIRCLE_TRANSITION) {
              if (options.density == null)
                  options.density = 5;
              if (options.speed == null)
                  options.speed = 5;
              fx.circles = [];
              /* Build the 2d array */
              for (let i=0;i<options.density;i++)
                  fx.circles[i] = [];
              /* p = y cord, i = x cord */
              for (let p=0;p<options.density;p++)
                  for (let i=0;i<options.density;i++)
                      fx.circles[i][p] = 0;

              fx.radius = 0;
          }
          if (type == FADE) {
              if (options.color == null)
                  options.color = COLORS[0];
              if (options.time == null)
                  options.time = 100;
              fx.opacity = 0;
          }
          if (type == FLASH) {
              if (options.color == null)
                  options.color = COLORS[0];
              if (options.time == null)
                  options.time = 100;
              fx.opacity = 1;
          }
      }

      function fxDraw() {
         if (fx.type === CIRCLE_TRANSITION) {
             /* p = y cord, i = x cord */
             let separation = 240 / fx.options.density;
             let finished = true;
              for (let p=0;p<fx.options.density;p++)
                  for (let i=0;i<fx.options.density;i++) {
                      /* Don't grow circles forever */
                      if (fx.circles[i][p] < separation) {
                          finished = false;
                      }
                      if (Math.sqrt(Math.pow(p*separation-120+separation/2,2)+Math.pow(i*separation-120+separation/2,2)) <= fx.radius) {
                          fx.circles[i][p]++;
                      }
                      /* If the circle's radius is more than 0 draw it*/
                      if (fx.circles[i][p] > 0) {
                          _ctx.fillStyle = COLORS[0];
                          _ctx.beginPath()
                          _ctx.arc(i*separation+separation/2,p*separation+separation/2,fx.circles[i][p],0,Math.PI*2);
                          _ctx.fill();
                      }
                  }
              fx.radius+= fx.options.speed;
             if (finished == true) {
                 let complete = fx.options.complete;
                 fx = {}
                 if (complete)
                     complete();
             }
          }
          /* Fade transition */
          else if (fx.type == FADE) {
              _ctx.beginPath();
              _ctx.globalAlpha = fx.opacity;
              _ctx.fillStyle = fx.options.color;
              _ctx.rect(0,0,WIDTH/2,HEIGHT/2);
              _ctx.fill();
              _ctx.globalAlpha = 1;
              fx.opacity += 1/fx.options.time;
              /* When complete */
              if (fx.opacity >= 1) {
                  let complete = fx.options.complete;
                  fx = {}
                  if (complete)
                      complete();
              }
          }
          /* Flash effect */
          else if (fx.type == FLASH) {
              _ctx.beginPath();
              _ctx.globalAlpha = fx.opacity;
              _ctx.fillStyle = fx.options.color;
              _ctx.rect(0,0,WIDTH/2,HEIGHT/2);
              _ctx.fill();
              _ctx.globalAlpha = 1;
              fx.opacity -= 1/fx.options.time;
              /* When complete */
              if (fx.opacity <= 0) {
                  let complete = fx.options.complete;
                  fx = {}
                  if (complete)
                      complete();
              }
          }
      }

      /* Background layer doesn't have to be drawn every frame */
      function bgDraw() {
          _bgCtx.clearRect(0,0,480,480);
          if (gameState == GAME_STATE) {
              /*Background*/
              for (var r=0;r<5;r++) {
                  for (var c=0;c<5;c++) {
                      let tileID = levelData[mission][level].data[r][c];
                      _bgCtx.drawImage(_tiles,48*(tileID%6),45*Math.floor(tileID/6),TILEWIDTH,TILEHEIGHT,c*TILEWIDTH,r*45 + 14,TILEWIDTH,TILEHEIGHT+1);
                  }
              }
              /* Draw grid */
              /*for (let i = 0; i < 6; i++) {
                _bgCtx.beginPath();
                _bgCtx.moveTo(i*TILEWIDTH,0);
                _bgCtx.lineTo(i*TILEWIDTH,HEIGHT/2);
                _bgCtx.stroke();
              }
              for (let i = 0; i < 6; i++) {
                _bgCtx.beginPath();
                _bgCtx.moveTo(0,i*TILEHEIGHT + 14);
                _bgCtx.lineTo(WIDTH/2,i*TILEHEIGHT + 14);
                _bgCtx.stroke();
              }*/
          } else if (gameState == MENU_STATE) {
              /* Title Menu */
              /* Background */
              _bgCtx.fillStyle = COLORS[1];
              _bgCtx.beginPath();
              _bgCtx.rect(0,0,240,120);
              _bgCtx.fill();
              _bgCtx.fillStyle = COLORS[2];
              _bgCtx.beginPath();
              _bgCtx.rect(0,120,240,120);
              _bgCtx.fill();
              /* Sun (even though it looks like a moon)*/
              _bgCtx.fillStyle = COLORS[3];
              _bgCtx.beginPath();
              _bgCtx.arc(200,43,25,0,Math.PI*2);
              _bgCtx.fill();
              /*Castle Begin*/
              _bgCtx.fillStyle = COLORS[0];
              _bgCtx.beginPath();
              _bgCtx.rect(100,70,130,70);
              _bgCtx.fill();
              _bgCtx.beginPath();
              _bgCtx.rect(100,50,20,20);
              _bgCtx.fill();
              _bgCtx.beginPath();
              _bgCtx.rect(100,50-20/3,20/3,20/3);
              _bgCtx.fill();
              _bgCtx.beginPath();
              _bgCtx.rect(100+40/3,50-20/3,20/3,20/3);
              _bgCtx.fill();
              _bgCtx.beginPath();
              _bgCtx.rect(210,50-20/3,20/3,20/3);
              _bgCtx.fill();
              _bgCtx.beginPath();
              _bgCtx.rect(210+40/3,50-20/3,20/3,20/3);
              _bgCtx.fill();

              _bgCtx.beginPath();
              _bgCtx.rect(165-15,20,30,50);
              _bgCtx.fill();

              _bgCtx.beginPath();
              _bgCtx.rect(165-15,20-30/3,30/3,30/3);
              _bgCtx.fill();

              _bgCtx.beginPath();
              _bgCtx.rect(165-15 + 60/3,20-30/3,30/3,30/3);
              _bgCtx.fill();

              /*Right Arm*/
              _bgCtx.beginPath();
              _bgCtx.moveTo(180,50);
              _bgCtx.lineTo(190,40);
              _bgCtx.lineTo(190,20);
              _bgCtx.lineTo(200,20);
              _bgCtx.lineTo(200,50);
              _bgCtx.lineTo(180,60);
              _bgCtx.closePath();
              _bgCtx.fill();
              /* Left Arm */
              _bgCtx.beginPath();
              _bgCtx.moveTo(150,50);
              _bgCtx.lineTo(140,40);
              _bgCtx.lineTo(140,20);
              _bgCtx.lineTo(130,20);
              _bgCtx.lineTo(130,50);
              _bgCtx.lineTo(150,60);
              _bgCtx.closePath();
              _bgCtx.fill();

              _bgCtx.beginPath();
              _bgCtx.rect(210,50,20,20);
              _bgCtx.fill();

              /*Flag pole*/
              _bgCtx.beginPath();
              _bgCtx.rect(20,85,5,130);
              _bgCtx.fill();

              /* Start Button */
              let bP = {x: 165 - 50, y: 170}
              _bgCtx.strokeStyle = COLORS[3];
              _bgCtx.lineWidth = 2;
              _bgCtx.fillStyle = COLORS[2];
              _bgCtx.beginPath();
              _bgCtx.rect(bP.x,bP.y,100,30);
              _bgCtx.fill();
              _bgCtx.stroke();
              _bgCtx.fillStyle = COLORS[1];
              _bgCtx.beginPath();
              _bgCtx.rect(bP.x - 1,bP.y + 31,102,5);
              _bgCtx.fill();
              _bgCtx.fillStyle = COLORS[1];
              _bgCtx.textAlign = "center";
              _bgCtx.font = "bold 18px Arial";
              _bgCtx.fillText("Start",bP.x + 50,bP.y + 22);

              /*Title text*/
              _bgCtx.shadowColor = COLORS[2];
              _bgCtx.shadowOffsetY = 2;
              _bgCtx.font = "bold 32px Arial";
              _bgCtx.textAlign = "center";
              _bgCtx.fillStyle = COLORS[3];
              _bgCtx.fillText("Split",47,33);
              _bgCtx.fillText("Army",47,63);
              _bgCtx.shadowOffsetY = 0;
          } else if (END_STATE) {
            _bgCtx.fillStyle = COLORS[0];
            _bgCtx.beginPath();
            _bgCtx.rect(0,0,WIDTH,HEIGHT);
            _bgCtx.fill();
            /*End Text*/
            _bgCtx.shadowColor = COLORS[2];
            _bgCtx.shadowOffsetY = 2;
            _bgCtx.font = "bold 26px Arial";
            _bgCtx.textAlign = "center";
            _bgCtx.fillStyle = COLORS[3];
            _bgCtx.fillText("Thanks for",WIDTH/4,70);
            _bgCtx.fillText("playing this demo!",WIDTH/4,100);
            _bgCtx.fillText("Leave feedback",WIDTH/4,160);
            _bgCtx.fillText("on the forums. <3",WIDTH/4,190);
            _bgCtx.shadowOffsetY = 0;
          }
      }

      /* Extra Stuff */
      document.getElementById("f").onclick = () => {
          if (fullscreen == false) {
              if (_gameDiv.webkitRequestFullscreen)
                  _gameDiv.webkitRequestFullscreen();
              if (_gameDiv.requestFullscreen)
                  _gameDiv.requestFullscreen();
              if (_gameDiv.mozRequestFullScreen)
                  _gameDiv.mozRequestFullScreen();
              if (_gameDiv.msRequestFullscreen)
                  _gameDiv.msRequestFullscreen();
          } else {
              if (document.exitFullscreen)
               document.exitFullscreen();
              if (document.webkitExitFullscreen)
                  document.webkitExitFullscreen();
              if (document.mozCancelFullScreen)
                  document.mozCancelFullScreen();
              if (document.msExitFullscreen)
                  document.msExitFullscreen();
          }
      }
      /* Resize Canvas for fullscreen-ness */
      function FShandler() {
          let canvases = _gameDiv.childNodes;
          if (fullscreen == false) {
              fullscreen = true;
              if (window.screen.width > window.screen.height) {
                  _gameDiv.style.height = "100%";
                  _gameDiv.style.width = screen.height;
                  //_gameDiv.style.width = screen.width;
                  _gameDiv.style.margin = "auto";
                  for (var i=0; i<canvases.length;i++){
                      canvases[i].style.maxWidth = "unset";
                      canvases[i].style.width = screen.height;
                      //canvases[i].style.width = screen.width;
                      canvases[i].style.height = "100%";
                      if (_gameDiv.offsetWidth > screen.height)
                          canvases[i].style.left = screen.width/2 - screen.height/2;
                  }
              } else {
                  _gameDiv.style.width = "100%";
                  _gameDiv.style.height = screen.width;
                  //_gameDiv.style.height = screen.height;
                  _gameDiv.style.margin = "auto";
                  for (var i=0; i<canvases.length;i++){
                      canvases[i].style.maxWidth = "unset";
                      canvases[i].style.width = "100%";
                      canvases[i].style.height = screen.width;
                      //canvases[i].style.height = screen.height;
                      if (_gameDiv.offsetHeight > screen.width)
                          canvases[i].style.top = screen.height/2 - screen.width/2;
                  }
              }
          } else {
              fullscreen = false;
              _gameDiv.style.width = _canvas.width;
              _gameDiv.style.height = _canvas.height;
              _gameDiv.style.margin = 0;
              for (let i=0; i<canvases.length;i++){
                      canvases[i].style.maxWidth = "100%";
                      canvases[i].style.width = WIDTH;
                      canvases[i].style.height = HEIGHT;
                      canvases[i].style.left = 0;
                      canvases[i].style.top = 0;
              }
          }
      }
      document.addEventListener("fullscreenchange", FShandler);
      document.addEventListener("webkitfullscreenchange", FShandler);
      document.addEventListener("mozfullscreenchange", FShandler);
      document.addEventListener("MSFullscreenChange", FShandler);

      //Desktop mouse input
      _gameDiv.onmousemove =  (e) => {
          let rect = _canvas.getBoundingClientRect();
          mouse.x = Math.round((e.clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
          mouse.y = Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));

          if (DEBUG) {
            let logTxt = document.createElement("P");
            logTxt.innerHTML = "Click Move: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
            document.getElementById("log").prepend(logTxt);
          }
      }
      _gameDiv.onmousedown = (e) => {
        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));
        mouse.down = true;
        mouse.click = true;

        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Click Down: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt);
        }
      }
      _gameDiv.onmouseup = (e) => {
        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));
        mouse.down = false;
        mouse.up = true;

        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Click Up: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt);
        }
      }
      //Mobile touch input
      _gameDiv.addEventListener("touchstart", (e) => {
        e.stopPropagation()

        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.touches[0].clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.touches[0].clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));
        mouse.down = true;
        mouse.click = true;

        /*Debug*/
        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Touch Start: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt);
        }
      }, false);

      _gameDiv.addEventListener("touchmove", (e) => {
        e.stopPropagation()

        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.touches[0].clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.touches[0].clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));

        //Show cords
        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Touch Move: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt);
        }
      }, false);

      _gameDiv.addEventListener("touchend", (e) => {
        e.stopPropagation()

        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.touches[0].clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.touches[0].clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));
        mouse.down = false;
        mouse.up = true;

        //Show cords
        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Touch End: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt);
        }
      }, false);

      _gameDiv.addEventListener("touchcancel", (e) => {
        e.stopPropagation()

        let rect = _canvas.getBoundingClientRect();
        mouse.x = Math.round((e.touches[0].clientX-rect.left)/(rect.right-rect.left)*(_canvas.width/2));
        mouse.y = Math.round((e.touches[0].clientY-rect.top)/(rect.bottom-rect.top)*(_canvas.height/2));
        mouse.down = false;
        mouse.up = true;

        //Show cords
        if (DEBUG) {
          let logTxt = document.createElement("P");
          logTxt.innerHTML = "Touch Cancel: " + mouse.x + ", " + mouse.y + " Mouse Down: " + mouse.down + " Mouse.click: " + mouse.click + " Mouse Up: " + mouse.up;
          document.getElementById("log").prepend(logTxt)
        }
      }, false);

      /*Start game*/
      if (DEBUG) {
        load();
      } else {
        BTALinit(_ctx);
      }
      document.addEventListener("animationFinished", () => {
        load();
      });
  }
