/**
 * play_hud.js
 *
 * Copyright (c) 2013 Petar Petrov
 *
 * This work is licensed under the Creative Commons Attribution-NoDerivs 3.0 Unported License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/3.0/.
 */

game.HUD = game.HUD || {};
/**
 * Status HUD
 */
game.HUD.Stats = me.ObjectContainer.extend({
    init: function() {
        // call the constructor
        this.parent();
        
        // non collidable
        this.collidable = false;
        
        // make sure our object is always draw first
        this.z = _Globals.gfx.zHUDStats;

        // give a name
        this.name = "HUD";

        this.x = _Globals.canvas.xOffsetHUD;
        this.y = _Globals.canvas.yOffsetHUD;
        this.xStep = 176;
        this.cxScreen = _Globals.canvas.gameWidth / 2;

        var parent = this;
        var wizards = [
            _Globals.wizards.Earth,
            _Globals.wizards.Water,
            _Globals.wizards.Fire,
            _Globals.wizards.Air
        ];
        var wx = this.x;
        var wy = this.y;
        var face;
        var faceWidth = 56;
        this.faceWidth = faceWidth;

        wizards.forEach(function(w) {
            var sprite = new me.AnimationSheet(wx, wy, me.loader.getImage('hud_faces'), faceWidth);

            switch(w) {
                case _Globals.wizards.Earth:
                    sprite.setAnimationFrame(0);
                break;
                case _Globals.wizards.Water:
                    sprite.setAnimationFrame(1);
                break;
                case _Globals.wizards.Fire:
                    sprite.setAnimationFrame(2);
                break;
                case _Globals.wizards.Air:
                    sprite.setAnimationFrame(3);
                break;
                default:
                    throw "HUD: Unknown wizard " + wizard;
                break;
            }
            
            sprite.animationpause = true;
            parent.addChild(sprite);

            wx += parent.xStep;
        });
        // text placeholder
        var pcX = this.x + _Globals.canvas.gameWidth - 227;
        var pcY = wy + 8;
        var sprite = new me.SpriteObject(pcX, pcY, me.loader.getImage('hud_text'));
        parent.addChild(sprite);
        // font to draw texts
        this.text = null;
        this.font = new me.Font('dafont', '14px', 'white', 'left');
        this.font.textBaseline  = 'top';
        this.xText = pcX + 5;
        this.yText = pcY + 7;
    },

    draw: function(context) {
        this.parent(context);
        if (this.text) {
            this.font.draw(context, this.text, this.xText, this.yText);
        }
    },

    drawText: function(text) {
        this.text = text;
    },

    clearText: function() {
        this.text = null;
    },

    updateMana: function(wizard, amount) {
        // TODO: use local references instead of getEntityByProp
        var bars = this.getEntityByProp('name', 'manabar_' + wizard);
        for (var i = bars.length - 1; i >= 0; i--) {
            this.removeChild(bars[i]);
        }

        var mx;
        var icon;
        switch(wizard) {
            case _Globals.wizards.Earth:
                mx = 0;
                icon = 0;
            break;
            case _Globals.wizards.Water:
                mx = this.xStep;
                icon = 1;
            break;
            case _Globals.wizards.Fire:
                mx = this.xStep * 2;
                icon = 2;
            break;
            case _Globals.wizards.Air:
                mx = this.xStep * 3;
                icon = 3;
            break;
            default:
                throw "HUD: Unknown wizard " + wizard;
            break;
        }

        mx += this.x + this.faceWidth + 2;

        // draw mana bars
        for(var i = 0; i < amount; i++) {
            var manabar = new me.AnimationSheet(mx, this.y + 28, me.loader.getImage('hud_mana'), 10);
            manabar.setAnimationFrame(icon);
            manabar.animationpause = true;
            manabar.name = 'manabar_' + wizard;
            manabar.isEntity = true;
            this.addChild(manabar);            

            mx += 10 + 1;
        }        
        // draw empty mana bars (MaxMana=10)
        for(var i = 0; i < 10 - amount; i++) {
            var manabar = new me.AnimationSheet(mx, this.y + 28, me.loader.getImage('hud_mana'), 10);
            manabar.setAnimationFrame(4);
            manabar.animationpause = true;
            manabar.name = 'manabar_' + wizard;
            manabar.isEntity = true;
            this.addChild(manabar);            

            mx += 10 + 1;
        }         
    }
});
/**
 * Base UI Dialog container 
 */
game.HUD.Container = me.ObjectContainer.extend({
    init: function(eventHandler, settings) {
        // call the constructor
        this.parent();
        
        // non collidable
        this.collidable = false;
        
        // make sure our object is always draw first
        this.z = _Globals.gfx.zHUD;

        // give a name
        this.name = "HUD";

        // (default) event handler 
        this.eventHandler = eventHandler;

        // background
        settings.dlg_type = settings.dlg_type || 'dlg_small';
        if (settings.dlg_type === 'dlg_small') {
            this.width = 448;
            this.height = 120;
        } else { // if (settings.dlg_type === 'dlg_big') {
            settings.dlg_type = 'dlg_big';
            this.width = 503;
            this.height = 120;
        }

        this.cx = _Globals.canvas.xOffsetHUD + _Globals.canvas.gameWidth / 2 - this.width / 2;
        this.cy = _Globals.canvas.gameHeight - 120;
        this.endx = this.cx + this.width;
        this.endy = this.cy + this.height;

        this.imageBackground = new me.SpriteObject(this.cx, this.cy, me.loader.getImage(settings.dlg_type));
        this.imageBackground.alpha = 0.95;
        this.addChild(this.imageBackground);

        // wizard face
        this.faceWidth = 79;
        this.imageFaceSlot = new me.AnimationSheet(this.cx + 14, this.cy + 14, 
            me.loader.getImage('dlg_faces'), 
            this.faceWidth);

        switch(settings.wizard) {
            case _Globals.wizards.Earth:
                this.imageFaceSlot.setAnimationFrame(0);
            break;
            case _Globals.wizards.Water:
                this.imageFaceSlot.setAnimationFrame(1);
            break;
            case _Globals.wizards.Fire:
                this.imageFaceSlot.setAnimationFrame(2);
            break;
            case _Globals.wizards.Air:
                this.imageFaceSlot.setAnimationFrame(3);
            break;
            default:
                throw "HUD: Unknown wizard " + wizard;
            break;
        }
        this.imageFaceSlot.animationpause = true;
        this.imageFaceSlot.z =  _Globals.gfx.zHUD + 1;
        this.addChild(this.imageFaceSlot);

        // dialog center
        this.xcenter = this.cx + this.width / 2;
        this.ycenter = this.cy + this.height / 2;        
    },
    // Propagate UI event to handler
    onEvent: function(name) {
        if (this.eventHandler) {
            this.eventHandler[name].call(this.eventHandler, Array.prototype.slice.call(arguments, 1));
        }
    }
});
/**
 * Clickable UI element
 */
game.HUD.Clickable = me.GUI_Object.extend({   
    init: function(x, y, settings) {
        settings = settings || {};
        if (!settings.image)
            throw "Clickable image not specified!";

        settings.spritewidth = settings.spritewidth || 64;
        settings.spriteheight = settings.spriteheight || 64;
        this.parent(x, y, settings);
        this.z = settings.z || (_Globals.gfx.zHUD + 1);
        this.handler = settings.onClick;
    },
    onClick: function(event) {
        // play sound
        me.audio.play('click', false);
        
        this.handler && this.handler(event);
        // don't propagate the event
        return false;
    }
});
/**
 * Clickable Animation UI element
 */
game.HUD.ClickableAnimation = me.AnimationSheet.extend({
    init: function(x, y, settings) {

        // default size
        settings.width = settings.width || 64;
        settings.height = settings.height || 64;
        // init base obj
        this.parent(x, y, me.loader.getImage(settings.image), settings.width, settings.height);
        
        this.handler = settings.onClick;
        this.z = settings.z || (_Globals.gfx.zHUD + 5);

        // override animation speed
        settings.speed = settings.speed || 75;
        this.addAnimation('main', settings.frames, settings.speed);
        this.setCurrentAnimation('main');
        if (settings.paused === true)
            this.animationpause = true;

        this.fadeout = settings.fadeout || false;
        this.fadeoutspeed = settings.fadeoutspeed || 0.035;
        this.stopFrame = settings.stopFrame || false;
        this.blend = false;

        var parent = this;

        // click event
        this.touchRect = new me.Rect(new me.Vector2d(x, y), settings.width, settings.height);
        me.input.registerPointerEvent('mousedown', this.touchRect, this.onClick.bind(this));
    },
    
    onClick: function() {
        me.input.releasePointerEvent('mousedown', this.touchRect);

        // play sound
        me.audio.play('click', false);
        
        if (this.stopFrame) {
            this.setAnimationFrame(this.stopFrame);
            this.animationpause = true;
        }

        if (this.fadeout === true) {
            this.blend = true;
            this.animationpause = true;
        } else {
           this.handler && this.handler(); 
        }
    },

    setFadeout: function(enabled) {
        this.fadeout = enabled;
    },

    update: function() {
        this.parent();
        /**
         * Notify caller that animation has been clicked only
         * after the fadeout post animation completes.
         */
        if (this.blend) {
            this.alpha -= this.fadeoutspeed * me.timer.tick;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this.visible = false;
                this.blend = false;
                this.handler && this.handler(); // XXX: no handler
            }
        }
        return true;
    }
});
/**
 * Dialog: Select Chance or Spell dialog
 */
game.HUD.SelectMove = game.HUD.Container.extend({
    init: function(eventHandler, settings) {
        this.parent(eventHandler, settings);

        var parent = this;
        this.iconWidth = 148;
        this.iconHeight = 85;
        this.iconX = this.cx + 112;
        this.iconY = this.cy + this.height / 2 - this.iconHeight / 2;

        this.addChild(new game.HUD.ClickableAnimation(this.iconX, this.iconY, {
            image: 'dlg_btn_choice',
            width: this.iconWidth,
            height: this.iconHeight,
            frames: [0],
            paused: true,
            fadeout: true,
            fadeoutspeed: 0.1,
            onClick: function(event) {
                parent.onEvent('onSelectDice');
            }
        }));

        this.addChild(new game.HUD.ClickableAnimation(this.iconX + this.iconWidth + 8, this.iconY, {
            image: 'dlg_btn_choice',
            width: this.iconWidth,
            height: this.iconHeight,
            frames: [1],
            paused: true,
            fadeout: true,
            fadeoutspeed: 0.1,
            onClick: function(event) {
                parent.onEvent('onSelectSpell');
            }
        }));
    }
});
/**
 * Dialog: Throw dice 
 */
game.HUD.ThrowDice = game.HUD.Container.extend({
    init: function(eventHandler, settings) {
        this.parent(eventHandler, settings);

        var parent = this;
        this.iconWidth = 148;
        this.iconHeight = 85;
        this.iconX = this.cx + this.width / 2 - this.iconWidth / 2 + this.faceWidth / 2;
        this.iconY = this.cy + this.height / 2 - this.iconHeight / 2;

        var icon_image;

        switch(settings.chance) {
            case _Globals.chance.Move1:
                icon_image = 'icon_move1';
            break;
            case _Globals.chance.Move2:
                icon_image = 'icon_move2';
            break;
            case _Globals.chance.Numb:
                icon_image = 'icon_pass';
            break;
            case _Globals.chance.Mana1:
                icon_image = 'icon_move1';
            break;
            case _Globals.chance.Mana2:
                icon_image = 'icon_move2';
            break;
            case _Globals.chance.Jump:
                icon_image = 'icon_jump';
            break;            
        }  

        this.addChild(new game.HUD.ClickableAnimation(this.iconX, this.iconY, {
            image: 'dlg_btn_choice',
            width: this.iconWidth,
            height: this.iconHeight,
            frames: [2],
            paused: true,
            fadeout: true,
            fadeoutspeed: 0.1,
            onClick: function(event) {
                parent.diceAnim.onClick();
            }
        }));   

        var icon = new game.HUD.Clickable(this.iconX + 46, this.iconY + 20, {
            image: icon_image,
            onClick: function(event) {
                parent.onEvent('onDiceThrown');
            }
        });
        // only clickable when the dice side is revealed
        icon.isClickable = false;

        // // play sound
        me.audio.play('rolldice', true);
        
        this.diceAnim = new game.HUD.ClickableAnimation(this.iconX + 50, this.iconY + 20, {
            image: 'dlg_dice_anim',
            z: _Globals.gfx.zHUD + 6,
            width: 52,
            height: 49,
            frames: [0, 1, 2, 3, 4, 5],
            speed: 100,
            fadeout: true,
            stopFrame: (settings.chance - 1), // set dice side
            onClick: function(event) {
                parent.diceAnim.animationpause = true;
                parent.addChild(icon);
                icon.isClickable = true;                

                // play sound
                me.audio.stop('rolldice');
                me.audio.play('rolldice2', false);
            }
        });            
        this.addChild(this.diceAnim);
    }
});
/**
 * Dialog: Select spell
 * TODO: refactor!
 */
game.HUD.SelectSpell = game.HUD.Container.extend({

    init: function(eventHandler, settings) {
        settings = settings || {};
        settings.dlg_type = 'dlg_big';
        this.parent(eventHandler, settings);

        this.iconWidth = 74;
        this.iconHeight = 85;        

        var parent = this;
        var special;

        this.spells = [
            {
                frames: [0],
                type: _Globals.spells.Abyss,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Abyss); }
            },
            {
                image: 'dlg_btn_spells',
                width: this.iconWidth,
                height: this.iconHeight,
                frames: [1],
                type: _Globals.spells.Change,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Change); }
            },
            {
                frames: [2],
                fadeout: true,
                type: _Globals.spells.Clay,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Clay); }
            },
        ];

        switch(settings.wizard) {
            case _Globals.wizards.Earth:
            special = {
                frames: [3],
                type: _Globals.spells.Path,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Path); }
            };
            break;
            case _Globals.wizards.Water:
            special = {
                frames: [4],
                type: _Globals.spells.Freeze,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Freeze); }
            };
            break;
            case _Globals.wizards.Fire:
            special = {
                frames: [5],
                type: _Globals.spells.Blind,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Blind); }
            };
            break;
            case _Globals.wizards.Air:
            special = {
                frames: [6],
                type: _Globals.spells.Teleport,
                onClick: function() {parent.onEvent('onCastSpell', _Globals.spells.Teleport); }
            };       
            break;
        }
        
        this.spells.push(special);

        // set common animation properties
        for (var i = this.spells.length - 1; i >= 0; i--) {
            _.extend(this.spells[i], {
                image: 'dlg_btn_spells',
                width: this.iconWidth,
                height: this.iconHeight,
                fadeout: true,
                fadeoutspeed: 0.1,
            });
        };

        // adjust positions
        var startx = this.cx + this.faceWidth + 56;
        var starty = this.cy + this.height / 2 - this.iconHeight / 2;

        for(var i = 0; i < this.spells.length; i++) {
            var icon = new game.HUD.ClickableAnimation(startx, starty, this.spells[i]);
            if (!game.gamemaster.isCanCast(settings.wizard, this.spells[i].type)) {
                icon.alpha = 0.5;
                icon.setFadeout(false);
            }
            this.addChild(icon);
            startx += this.iconWidth + 4;
        }
        // add exit button
        startx += 4;
        this.addChild(
            new game.HUD.ClickableAnimation(startx, starty + 10, {
                image: 'dlg_btn_back',
                width: 38,
                height: 65,
                frames: [0],
                fadeout: true,
                fadeoutspeed: 0.1,
                onClick: function() {
                    parent.onEvent('onCancelSelectSpell');
                }
            }));        
    }
});