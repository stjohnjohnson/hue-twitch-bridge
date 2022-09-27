
import { model } from 'node-hue-api'
import colornames from 'colornames'
import randomColor from 'randomcolor'
import Colr from 'colr'

const hexColor = /^#[a-fA-F0-9]{6}$/;

export function convertColorToState(name) {
    let hex = null;
    if (hexColor.test(name)) {
        hex = name.toUpperCase();
    } else if (name == 'random') {
        hex = randomColor()
    } else {
        hex = colornames(name);
    }

    // Skip if it's not a color we know
    if (!hex) {
        return null;
    }
    let newState = new model.lightStates.GroupLightState();

    var color = Colr.fromHex(hex).toHsvObject();
    return newState.hue(color.h/360*65535).saturation(color.s).brightness(color.v)
}