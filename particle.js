class Particle {
    constructor(x, y, targetX, targetY) {
        this.position = createVector(x, y);
        this.target = createVector(targetX, targetY);
        this.speed = createVector(0, 0);
    }

    draw() {
        point(this.position);
    }

    applyForce(force) {
        this.speed.add(force);
    }

    update() {
        this.position.add(this.speed);
    }
}