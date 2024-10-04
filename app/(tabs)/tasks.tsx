import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

enum TaskAction {
  Stop = "stop",
  Slow = "slow",
  Go = "go",
}

interface ActionModel {
  label: string;
  isCompleted: boolean;
}

interface TaskModel {
  title: string;
  subtitle: string;
  actions: Record<TaskAction, ActionModel>;
}

const initialTasksState = [
  {
    title: "Shift",
    subtitle: "Practice shifiting your mind",
    actions: {
      stop: { label: "Stop", isCompleted: false },
      slow: { label: "Slow", isCompleted: false },
      go: { label: "Go", isCompleted: false },
    },
  },
  {
    title: "Energize",
    subtitle: "Eat health food",
    actions: {
      stop: { label: "Stop", isCompleted: false },
      slow: { label: "Slow", isCompleted: false },
      go: { label: "Go", isCompleted: false },
    },
  },
  {
    title: "Focus",
    subtitle: "Concentrate on your task",
    actions: {
      stop: { label: "Stop", isCompleted: false },
      slow: { label: "Slow", isCompleted: false },
      go: { label: "Go", isCompleted: false },
    },
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<TaskModel[]>(initialTasksState);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setTasks(initialTasksState);
    }, 500);
  }, []);

  useFocusEffect(useCallback(() => refresh(), []));

  const handleAction = useCallback(
    (action: TaskAction, task: TaskModel) => {
      setTasks(
        tasks.map((t) =>
          t.title === task.title
            ? {
                ...t,
                actions: {
                  ...t.actions,
                  [action]: {
                    ...t.actions[action],
                    isCompleted: true,
                  },
                },
              }
            : t
        )
      );
    },
    [tasks]
  );

  const enabledTaskIndex = useMemo(
    () =>
      tasks.findLastIndex((task) =>
        Object.values(task.actions).every((action) => action.isCompleted)
      ),
    [tasks]
  );

  return (
    <SafeAreaView>
      <ScrollView
        style={{ height: "100%", paddingHorizontal: 30 }}
        contentContainerStyle={{ gap: 25 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {tasks.map((task, index) => (
          <TaskItem
            task={task}
            disable={index > enabledTaskIndex + 1}
            onActionPress={handleAction}
            key={index}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

interface TaskItemProps {
  task: TaskModel;
  disable: boolean;
  onActionPress(action: TaskAction, task: TaskModel): void;
}
const TaskItem = ({ task, disable, onActionPress }: TaskItemProps) => {
  const isTaskCompleted = useMemo(
    () => Object.values(task.actions).every((a) => a.isCompleted),
    [task.actions]
  );

  return (
    <View style={{ backgroundColor: "white", borderRadius: 10, padding: 20 }}>
      {disable ? <View style={styles.cardOverlay} /> : null}
      <View style={styles.card}>
        <Text style={{ fontSize: 30 }}>{task.title}</Text>
        {isTaskCompleted ? (
          <Ionicons name="checkmark-circle" size={32} color="green" />
        ) : (
          <Ionicons name="checkmark-circle-outline" size={32} color="silver" />
        )}
      </View>
      <Text style={{ fontSize: 20 }}>{task.subtitle}</Text>
      <View style={styles.cardActions}>
        {Object.entries(task.actions).map(([key, action], index) => (
          <Pressable
            key={key}
            onPress={() => onActionPress(key as TaskAction, task)}
            style={{ flex: 1 }}
          >
            <ActionBadge action={action} index={index} task={task} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

interface ActionBadgeProps {
  action: ActionModel;
  index: number;
  task: TaskModel;
}
const ActionBadge = ({ action, index, task }: ActionBadgeProps) => {
  const actions = useMemo(() => {
    return Object.values(task.actions);
  }, [task, task.actions]);

  // based on completion of privious steps
  const isCurrentStep = useMemo(
    () => !actions.slice(0, index).some((a) => !a.isCompleted),
    [task, task.actions, index]
  );

  const doneLabel = useMemo(() => {
    switch (index) {
      case 0:
        return "Done.";
      case 1:
        return "Done!";
      default:
        return "Done!!";
    }
  }, [index]);

  return (
    <View
      style={{
        backgroundColor: action.isCompleted
          ? "silver"
          : isCurrentStep
          ? "black"
          : "white",
        borderRadius: 30,
        borderColor: action.isCompleted ? "silver" : "black",
        borderWidth: 1,
        paddingVertical: 8,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: action.isCompleted
            ? "black"
            : isCurrentStep
            ? "white"
            : "black",
        }}
      >
        {action.isCompleted ? doneLabel : action.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    zIndex: 2,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
});

export default Tasks;
