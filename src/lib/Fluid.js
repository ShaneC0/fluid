

export default class Fluid {
    constructor(dt, diffusion, viscosity) {
        this.dt = dt;
        this.diffusion = diffusion;
        this.viscosity = viscosity;
    }
}