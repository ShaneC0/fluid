import Fluid from './Fluid';
import Field from './Field';


//density
//vx - x velocity
//vy - y velocity
//s - density sources

export default function testField() {
    let fluid = new Fluid(0.5, 0.5, 0);
    let field = new Field(20, fluid)

    field.density[0] = 20;
    field.vx[0] = 10;
    field.vy[0] = -10;

    console.log(field.density)

    field.step_simulation()

    console.log(field.density)
}
