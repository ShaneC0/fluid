const Fluid = require('./Fluid')
const Field = require('./Field')

let fluid = new Fluid(0.5, 0, 0);
let field = new Field(10, fluid)

field.density[10] = 10;
console.log(field.density)
console.log(field.density[field.IX(0, 1)])