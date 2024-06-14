const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 500;

const gridSize = 20;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;
const moveSpeed = 0.2; // Determines the smoothness of movement

let backgroundImage = new Image();
backgroundImage.src = 'environment.jpeg';

let plantImage = new Image();
plantImage.src = 'berry.png';

class Entity {
    constructor(x, y, type, lifespan) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.targetX = x;
        this.targetY = y;
        this.lifespan = lifespan;
        this.age = 0;
    }

    setTargetPosition(x, y) {
        this.targetX = Math.max(0, Math.min(x, cols - 1));
        this.targetY = Math.max(0, Math.min(y, rows - 1));
    }

    move() {
        if (Math.abs(this.x - this.targetX) > moveSpeed) {
            this.x += Math.sign(this.targetX - this.x) * moveSpeed;
        } else {
            this.x = this.targetX;
        }

        if (Math.abs(this.y - this.targetY) > moveSpeed) {
            this.y += Math.sign(this.targetY - this.y) * moveSpeed;
        } else {
            this.y = this.targetY;
        }
    }

    ageOneStep() {
        this.age++;
    }

    isOld() {
        return this.age >= this.lifespan;
    }
}


class Plant extends Entity {
    constructor(x, y) {
        super(x, y, 'P');
    }

    draw() {
        ctx.drawImage(plantImage, this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }
}

class Prey extends Entity {
    constructor(x, y) {
        super(x, y, 'R', 100); // Prey has a lifespan of 100 steps
        this.eatenPlants = 0; // Track plants eaten
        this.starvationThreshold = 50; // Prey dies if it doesn't eat for 50 steps
        this.stepsSinceLastMeal = 0;
    }

    move(predatorList) {
        let closestPredator = null;
        let minDist = Infinity;

        for (let predator of predatorList) {
            const dist = Math.hypot(predator.x - this.x, predator.y - this.y);
            if (dist < minDist) {
                minDist = dist;
                closestPredator = predator;
            }
        }

        if (closestPredator && minDist < 5) { // Only try to escape if a predator is within a certain range
            const dx = this.x - closestPredator.x;
            const dy = this.y - closestPredator.y;
            const newX = this.x + Math.sign(dx) * Math.random() * 3;
            const newY = this.y + Math.sign(dy) * Math.random() * 3;
            this.setTargetPosition(newX, newY);
        } else {
            // Move randomly when not immediately threatened
            if (Math.random() < 0.1) {
                const newX = Math.floor(this.targetX + Math.random() * 3 - 1);
                const newY = Math.floor(this.targetY + Math.random() * 3 - 1);
                this.setTargetPosition(newX, newY);
            }
        }

        super.move();
        this.stepsSinceLastMeal++;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }

    eatPlant() {
        this.eatenPlants++;
        this.stepsSinceLastMeal = 0; // Reset steps since last meal
        if (this.eatenPlants >= 1) {
            this.eatenPlants = 0;
            return new Prey(this.x, this.y);
        }
        return null;
    }

    isStarving() {
        return this.stepsSinceLastMeal >= this.starvationThreshold;
    }
}


class Predator extends Entity {
    constructor(x, y) {
        super(x, y, 'D', 150); // Predator has a lifespan of 150 steps
        this.starvationThreshold = 70; // Predator dies if it doesn't catch prey for 70 steps
        this.stepsSinceLastMeal = 0;
    }

    move(preyList, predatorCount) {
        if (preyList.length >= 2 * predatorCount) {
            let closestPrey = null;
            let minDist = Infinity;

            for (let prey of preyList) {
                const dist = Math.hypot(prey.x - this.x, prey.y - this.y);
                if (dist < minDist) {
                    minDist = dist;
                    closestPrey = prey;
                }
            }

            if (closestPrey) {
                this.setTargetPosition(closestPrey.x, closestPrey.y);
            } else if (Math.random() < 0.1) {
                const newX = Math.floor(this.targetX + Math.random() * 3 - 1);
                const newY = Math.floor(this.targetY + Math.random() * 3 - 1);
                this.setTargetPosition(newX, newY);
            }
        } else {
            // Random movement when not chasing prey
            if (Math.random() < 0.1) {
                const newX = Math.floor(this.targetX + Math.random() * 3 - 1);
                const newY = Math.floor(this.targetY + Math.random() * 3 - 1);
                this.setTargetPosition(newX, newY);
            }
        }

        super.move();
        this.stepsSinceLastMeal++;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }

    catchPrey(preyCount, predatorCount) {
        if (preyCount >= predatorCount) {
            this.stepsSinceLastMeal = 0; // Reset steps since last meal
            return new Predator(this.x, this.y);
        }
        return null;
    }

    isStarving() {
        return this.stepsSinceLastMeal >= this.starvationThreshold;
    }
}


class Simulation {
    constructor() {
        this.entities = [];
        this.steps = 0;
        this.rainEnabled = true;

        this.init();
        this.bindUI();
    }

    init() {
        for (let i = 0; i < 10; i++) {
            this.entities.push(new Plant(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)));
        }
        for (let i = 0; i < 10; i++) {
            this.entities.push(new Prey(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)));
        }
        this.entities.push(new Predator(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)));

        this.loop();
    }

    bindUI() {
        document.getElementById('rainButton').addEventListener('click', () => {
            this.rainEnabled = !this.rainEnabled;
        });
    }

    update() {
        const preyList = this.entities.filter(entity => entity instanceof Prey);
        const predatorList = this.entities.filter(entity => entity instanceof Predator);
        const predatorCount = predatorList.length;
        const preyCount = preyList.length;

        this.entities.forEach(entity => {
            if (entity instanceof Prey) {
                entity.move(predatorList);
            } else if (entity instanceof Predator) {
                entity.move(preyList, predatorCount);
            }
        });

        this.handleInteractions(preyCount, predatorCount);

        if (this.rainEnabled && ++this.steps % 100 === 0) {
            this.rain();
        }

        this.preyCount = preyCount;
        this.predatorCount = predatorCount;

        // Update counts
        this.updateCounts();
    }

    handleInteractions(preyCount, predatorCount) {
        const newEntities = [];

        for (let i = this.entities.length - 1; i >= 0; i--) {
            for (let j = this.entities.length - 1; j >= 0; j--) {
                if (i !== j && Math.floor(this.entities[i].x) === Math.floor(this.entities[j].x) && Math.floor(this.entities[i].y) === Math.floor(this.entities[j].y)) {
                    if (this.entities[i] instanceof Prey && this.entities[j] instanceof Plant) {
                        const newPrey = this.entities[i].eatPlant();
                        if (newPrey) newEntities.push(newPrey);
                        this.entities.splice(j, 1);
                        if (j < i) i--;
                    } else if (this.entities[i] instanceof Predator && this.entities[j] instanceof Prey) {
                        const newPredator = this.entities[i].catchPrey(preyCount, predatorCount);
                        if (newPredator) {
                            newEntities.push(newPredator);
                            this.entities.splice(j, 1);
                            if (j < i) i--;
                        }
                    }
                }
            }
        }

        this.entities.push(...newEntities);
    }

    rain() {
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
            this.entities.push(new Plant(x, y));
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        this.entities.forEach(entity => {
            entity.draw();
        });
    }

    updateCounts() {
        document.getElementById('preyCount').innerText = `Prey: ${this.preyCount}`;
        document.getElementById('predatorCount').innerText = `Predators: ${this.predatorCount}`;
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Simulation();
});
