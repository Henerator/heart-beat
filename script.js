let screenSize;
let particles = [];
let repulsions = [];

const settings = {
    applyRepulsion: false,
    heartFunctionAngleStep: 0.075,
    heartFunctionRatio: 13,
    heartBeatStartDelay: 1300,
    heartAttractionDuration: 250,
    heartRepulsionDuration: 700,
    brakingDistance: 100,
    repulsionDistance: 500,
    maxAttractionForce: 10,
    maxRepulsionForce: 9,
    maxSpeed: 40,
    backgroundColor: 30,
};

function updateScreenSize() {
    const bodyRect = document.body.getBoundingClientRect();
    screenSize = {
        width: bodyRect.width,
        height: bodyRect.height,
        center: createVector(bodyRect.width / 2, bodyRect.height / 2),
    };
    resizeCanvas(screenSize.width, screenSize.height)
}

function getHeartPoints() {
    const angleStep = settings.heartFunctionAngleStep;
    const ratio = settings.heartFunctionRatio;
    const points = [];
    for (let i = 0; i <= TWO_PI; i += angleStep) {
        points.push({
            x: ratio * 16 * Math.pow(Math.sin(i), 3),
            y: -ratio * (13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i)),
        });
    }
    return points;
}

function generateParticles() {
    const points = getHeartPoints();
    particles = points.map(point => {
        return new Particle(
            random(screenSize.width) - screenSize.width / 2,
            random(screenSize.height) - screenSize.height / 2,
            point.x,
            point.y
        );
    });
}

function generateRepulsors() {
    repulsions.push(createVector(0, 0));
    // repulsions.push(createVector(-95, -50));
    // repulsions.push(createVector(95, -50));
    // repulsions.push(createVector(0, 40));
}

function startHeartBeat() {
    function heartBeat() {
        const delay = settings.applyRepulsion
            ? settings.heartRepulsionDuration
            : settings.heartAttractionDuration;
        settings.applyRepulsion = !settings.applyRepulsion;
        setTimeout(heartBeat, delay);
    }

    setTimeout(heartBeat, settings.heartBeatStartDelay);
}

function setup() {
    createCanvas();
    updateScreenSize();

    window.addEventListener('resize', updateScreenSize);

    generateParticles();
    generateRepulsors();

    startHeartBeat();
}

function clearCanvas() {
    noStroke();
    fill(settings.backgroundColor);
    rect(0, 0, screenSize.width, screenSize.height);
}

function getAttraction(particle, attractor) {
    const desiredSpeed = p5.Vector.sub(attractor, particle.position);
    const targetDistance = desiredSpeed.mag();
    const speed = targetDistance < settings.brakingDistance
        ? map(targetDistance, 0, settings.brakingDistance, 0, settings.maxSpeed)
        : settings.maxSpeed;

    desiredSpeed.setMag(speed);

    return p5.Vector
        .sub(desiredSpeed, particle.speed)
        .limit(settings.maxAttractionForce);
}

function getRepulsion(particle, repulsor) {
    const desiredSpeed = p5.Vector.sub(repulsor, particle.position);
    const targetDistance = desiredSpeed.mag();
    if (targetDistance < settings.repulsionDistance) {
        desiredSpeed
            .setMag(settings.maxSpeed)
            .mult(-1);

        return p5.Vector
            .sub(desiredSpeed, particle.speed)
            .limit(settings.maxRepulsionForce);
    }

    return createVector(0, 0);
}

function applyAttraction(particle) {
    const attraction = getAttraction(particle, particle.target);
    particle.applyForce(attraction);
}

function applyRepulsion(particle) {
    const repulsionForce = repulsions.reduce((repulsion, repulsor) => {
        const force = getRepulsion(particle, repulsor);
        repulsion.add(force);
        return repulsion;
    }, createVector(0, 0));
    particle.applyForce(repulsionForce);
}

function limitSpeed(particle) {
    particle.speed.limit(settings.maxSpeed);
}

function drawParticles() {
    strokeWeight(17);
    stroke('#e74c3c');
    particles.forEach(particle => particle.draw());
}

function drawRepulsions() {
    repulsions.forEach(repulsion => {
        strokeWeight(settings.repulsionDistance);
        stroke(255, 50);
        point(repulsion);
    })
}

function draw() {
    clearCanvas();

    translate(screenSize.width / 2, screenSize.height / 2);
    drawParticles();

    update();
}

function update() {
    particles.forEach(particle => {
        applyAttraction(particle);
        settings.applyRepulsion && applyRepulsion(particle);
        limitSpeed(particle);

        particle.update();
    });
}
