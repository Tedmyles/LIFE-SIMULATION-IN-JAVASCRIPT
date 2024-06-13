![Screenshot 2024-06-13 120434](https://github.com/Tedmyles/LIFE-SIMULATION-IN-JAVASCRIPT/assets/134784483/94f4bf33-9276-4ddb-9bc5-1c6fe26dbc01)# LIFE SIMULATION IN JAVASCRIPT
 Life simulation project created using javascript

This project implements a basic life simulation where plants, prey, and predators interact within a confined environment represented by a grid on a canvas. The simulation is designed to showcase emergent behaviors such as predation, reproduction, and population dynamics.

Entities:
Plants (P): Static entities that serve as a food source for prey. They are randomly placed on the grid and do not move.

Prey (R): Mobile entities that move randomly across the grid and seek out plants to eat. Prey can also be hunted by predators.

Predators (D): Mobile entities that hunt prey for sustenance. They move towards prey within their vicinity and reproduce if prey populations are sufficient.

Behavior:
Movement: Entities move at a constant speed and change direction randomly or in response to environmental stimuli.

Interaction: Prey consume plants to sustain themselves. Predators hunt prey, and both prey and predators can reproduce under certain conditions.

Simulation Features:
Rain Toggle: Users can toggle rain, which introduces new plants randomly across the grid at intervals.

Population Dynamics: The simulation tracks and displays the counts of prey and predators dynamically as the simulation progresses.

**Future Enhancements:**
     -More complex behaviors such as territory marking, group behavior, or environmental adaptation.
     -User interaction to adjust simulation parameters or observe specific behaviors.
     -Enhanced visualizations or statistical analysis of population trends over time.
     ![life_simulation](https://github.com/Tedmyles/LIFE-SIMULATION-IN-JAVASCRIPT/assets/134784483/c4cd7445-4f7a-4294-8f00-d51b40e62462)
