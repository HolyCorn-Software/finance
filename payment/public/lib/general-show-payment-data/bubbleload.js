/*
Copyright 2021 HolyCorn Software
The BGI Swap Project
This widget is loading menu of 4 bouncing balls
*/

import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";

hc.importModuleCSS(import.meta.url)

export class Loader extends Widget{

    constructor(){
        super()

        this.html = document.spawn({
            class:'hc-bgis-genpayui-loader',
            innerHTML:`
                <div class='container'>
                    <div class='bubbles'>
                    </div>
                </div>
            `
        })

        let colors = ['#8AA0ED', '#8AED94', '#ED8AD7', '#EDCB8A']

        for(var i=0; i<4; i++){
            this.html.$('.bubbles').spawn({
                class:'bubble',
                style:{
                    'color':colors[i%colors.length],
                    'animation':`1s ${ i*0.25}s hc-bgis-genpayui-loader-bounce infinite`
                }
            })
        }
        
    }
    
}