export default class Field {
    constructor(_size, _fluid) {

        //length in cells of one side of the square
        this.size = _size;
        this.fluid = _fluid;

        //density sources, added from user interaction
        this.s = new Array(this.size * this.size).fill(0)

        //current velocity of all cells in the x and y direction
        this.vx = new Array(this.size * this.size).fill(0)
        this.vy = new Array(this.size * this.size).fill(0)

        //previous velocities of all cells in the x and y direction
        this.pvx = new Array(this.size * this.size).fill(0)
        this.pvy = new Array(this.size * this.size).fill(0)

        //current density values of all cells
        this.density = new Array(this.size * this.size).fill(0)

        //previous density values of all cells
        this.pdensity = new Array(this.size * this.size).fill(0)

        //Steps taken in Gauss-Seidel Relaxation
        //How accurate of an estimate the system produces
        //goes up with higher value
        this.diffusion_steps = 20
    }

    //Returns 1 dimensional index given 2 dimensional index.
    IX(i, j) {
        return parseInt((j * this.size) + i)
    }

    //
    set_boundaries(size, b, x) {
        for(let i = 1; i <= size; i++) {
            x[this.IX(0, i)]        = b == 1 ? -x[this.IX(1, i)]    : x[this.IX(1, i)];
            x[this.IX(size + 1, i)] = b == 1 ? -x[this.IX(size, i)] : x[this.IX(size, i)];
            x[this.IX(i, 0)]        = b == 2 ? -x[this.IX(i, 1)]    : x[this.IX(i, 1)];
            x[this.IX(i, size + 1)] = b == 2 ? -x[this.IX(i, size)] : x[this.IX(i, size)];
        }

        x[this.IX(0, 0)]               = 0.5 * (x[this.IX(1, 0)]           + x[this.IX(0, 1)]);
        x[this.IX(0, size + 1)]        = 0.5 * (x[this.IX(1, size + 1)]    + x[this.IX(0, size)]);
        x[this.IX(size + 1, 0)]        = 0.5 * (x[this.IX(size, 0)]        + x[this.IX(size + 1, 1)]);
        x[this.IX(size + 1, size + 1)] = 0.5 * (x[this.IX(size, size + 1)] + x[this.IX(size + 1, size)])
    }

    // Adds source from array 's' to corresponding density in array 'x'
    add_source(size, x, s, dt) {
        for(let i = 0; i < size; i++) {
            x[i] += dt*s[i];
        }
    }

    //adds velocity of magx to vx location indicated by x and y
    //adds velocity of magy to vy indicated by x and y
    add_vel(x, y, magX, magY) {
        this.vx[this.IX(x, y)] += magX;
        this.vy[this.IX(x, y)] += magY;
    }

    //adds density of mag to cell indicated by x and y
    add_density(x, y, mag) {
        this.density[this.IX(x, y)] += mag;
    }

    //Uses Gauss-Seidel Relaxation to work backwards
    //in time to find densities that, when defused 
    //backwards, produce the current densities
    diffuse(size, b, x, x0, diff, dt) {
        let a = dt * diff * this.size * this.size;

        for( let k = 0; k < this.diffusion_steps; k++) {
            for(let i = 1; i <= size; i++) {
                for(let j = 1; j <= size; j++) {
                    //what the fuck does this do
                    x[this.IX(i, j)] = (x0[this.IX(i, j)] + a * (
                                        x[this.IX(i-1, j)] + 
                                        x[this.IX(i+1, j)] + 
                                        x[this.IX(i, j-1)] + 
                                        x[this.IX(i, j+1)])) / (1+4*a);
                }
            }
            this.set_boundaries(size, b, x)
        }
    }

    //This step linearly backtraces through the grid to find
    //cells that end up exactly at a cells center.
    //It then uses linear interpolation to assign
    //a density value to those cells.
    advect(size, b, d, d0, u, v, dt) {
        let dt0 = dt*size;

        for(let i = 1; i <= size; i++) {
            for(let j = 1; j <= size; j++) {
                let x = i - dt0 * u[this.IX(i, j)];
                let y = j - dt0 * v[this.IX(i, j)];

                if(x < 0.5) x = 0.5;
                if(x > size + 0.5) x = size + 0.5;
                let i0 = parseInt(x);
                let i1 = i0 + 1;

                if(y < 0.5) y = 0.5; 
                if( y > size + 0.5) y = size + 0.5;
                let j0 = parseInt(y);
                let j1 = j0 + 1;

                let s1 = x - i0;
                let s0 = 1 - s1;
                let t1 = y - j0;
                let t0 = 1 - t1;

                d[this.IX(i, j)] = s0 * (
                    t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]
                ) + s1 * (
                    t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]
                )
            }
        }
        this.set_boundaries(size, b, d)
    }

    //The project step makes sure that the simulation conserves mass.
    //Hodge decomposition: Every velocity field is 
    //the sum of a mass conserving field and a gradient field.
    //This function uses Gauss-Seidel Relaxation to 
    //estimate the gradient field of the velocity field
    //which is basically the direction of steepest descent
    //at every point. We can then subtract this gradient field
    //from the velocity field to be left with a mass conserving field.
    project(size, u, v, p, div) {
        let h = 1.0 / size;

        for(let i = 1; i <= size; i++) {
            for(let j = 1; j <= size; j++) {
                div[this.IX(i, j)] = -0.5 * 
                                      h * 
                                      (u[this.IX(i-1, j)] - 
                                       u[this.IX(i-1, j)] +
                                       v[this.IX(i, j+1)] - 
                                       v[this.IX(i, j-1)]);
                
                p[this.IX(i, j)] = 0;
            }
        }

        this.set_boundaries(size, 0, div);
        this.set_boundaries(size, 0, p);

        for(let k = 0; k < this.diffusion_steps; k++) {
            for(let i = 1; i <= size; i++) {
                for(let j = 1; j <= size; j++) {
                    p[this.IX(i, j)] = (div[this.IX(i, j)] +
                                        p[this.IX(i-1, j)] +
                                        p[this.IX(i + 1, j)] +
                                        p[this.IX(i, j-1)] + 
                                        p[this.IX(i, j+1)]) / 4
                }
            }
            this.set_boundaries(size, 0, p)
        }

        for(let i = 1; i <= size; i++) {
            for(let j = 1; j <= size; j++) {
                u[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) / h;
                v[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) / h;
            }
        }

        this.set_boundaries(size, 1, u);
        this.set_boundaries(size, 2, v)
    }

    step_simulation() {

        console.log(this.density)


        //update velocity
        this.diffuse(this.size, 1, this.pvx, this.vx, this.fluid.diffusion, this.fluid.dt)
        this.diffuse(this.size, 2, this.pvy, this.vy, this.fluid.diffusion, this.fluid.dt)

        this.project(this.size, this.pvx, this.pvy, this.vx, this.vy)

        this.advect(this.size, 1, this.vx, this.pvx, this.pvx, this.pvy, this.fluid.dt)
        this.advect(this.size, 2, this.vy, this.pvy, this.pvx, this.pvy, this.fluid.dt)

        this.project(this.size, this.vx, this.vy, this.pvx, this.pvy)

        //update density
        this.diffuse(this.size, 0, this.s, this.density, this.fluid.diffusion, this.fluid.dt)
        this.advect(this.size, 0, this.density, this.s, this.vx, this.vy, this.fluid.dt)

    }
}