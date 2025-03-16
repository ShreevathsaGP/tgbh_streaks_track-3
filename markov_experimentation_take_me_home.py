import numpy as np
import random
import matplotlib.pyplot as plt

def generate_transition_matrix(states):
    """Generate a random transition matrix for a given number of states."""
    matrix = np.random.rand(states, states)
    matrix /= matrix.sum(axis=1, keepdims=True)
    return matrix

def predict_path(transition_matrix, start_state, goal_state, steps):
    """Simulate path prediction based on the transition matrix until the goal is reached."""
    path = [start_state]
    current_state = start_state
    
    for _ in range(steps):
        next_state = np.random.choice(len(transition_matrix), p=transition_matrix[current_state])
        path.append(next_state)
        current_state = next_state
        
        if current_state == goal_state:
            break
    
    return path

def visualize_path(path, num_states, goal_state):
    plt.figure(figsize=(10, 4))
    
    plt.plot(range(len(path)), path, marker='o', linestyle='-', color='b', markersize=8, label='Auto Ride Path')
    
    goal_index = path.index(goal_state)
    plt.scatter(goal_index, path[goal_index], color='r', zorder=5, label='Goal State', s=100, marker='D')
    
    plt.yticks(range(num_states), [f'Location {i}' for i in range(num_states)])
    plt.xlabel("Step")
    plt.ylabel("Location")
    plt.title("Predicted Taxi Ride Path with Goal State")
    plt.legend()
    plt.grid()
    plt.show()

num_states = 5 
transition_matrix = generate_transition_matrix(num_states)

start_state = random.randint(0, num_states - 1)
goal_state = random.randint(0, num_states - 1)
while goal_state == start_state:
    goal_state = random.randint(0, num_states - 1)

predicted_path = predict_path(transition_matrix, start_state, goal_state, 10)

print("Transition Matrix:")
print(transition_matrix)
print(f"\nStart Location: {start_state}, Goal Location: {goal_state}")
print("\nPredicted Path:", predicted_path)

visualize_path(predicted_path, num_states, goal_state)