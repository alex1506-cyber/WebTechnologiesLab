import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // Refs for animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  // Load tasks from storage on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addOrUpdateTask = () => {
    if (task.trim()) {
      if (editingTask) {
        // Update task if editing
        setTasks(tasks.map(t => t.id === editingTask ? { ...t, text: task } : t));
        setEditingTask(null);
      } else {
        // Add new task with animation
        const newTask = { id: Date.now().toString(), text: task, completed: false };
        setTasks([...tasks, newTask]);
        animateTaskAddition();
      }
      setTask('');
    }
  };

  const animateTaskAddition = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const deleteTask = (taskId) => {
    // Animate task deletion
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTasks(tasks.filter(t => t.id !== taskId));
    });
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const startEditingTask = (taskId) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      setTask(taskToEdit.text);
      setEditingTask(taskId);
    }
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[
      styles.taskContainer, 
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <TouchableOpacity
        style={[styles.taskTextContainer, item.completed && styles.completedTask]}
        onPress={() => toggleTask(item.id)}
        onLongPress={() => startEditingTask(item.id)}
      >
        <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addOrUpdateTask}>
          <Text style={styles.addButtonText}>{editingTask ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#34495e',
    backgroundColor: '#ecf0f1',
  },
  addButton: {
    backgroundColor: '#3498db',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderColor: '#ecf0f1',
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#34495e',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  completedTask: {
    backgroundColor: '#e0e7ef',
    borderRadius: 8,
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#e74c3c',
  },
});