import { Link } from "expo-router";
import { Text, FlatList, TouchableOpacity } from "react-native";

const projects = [
  { id: "1", name: "Project Alpha" },
  { id: "2", name: "Project Beta" },
];

export default function ProjectList() {
  return (
    <FlatList
      data={projects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link href={`/project/${item.id}`} asChild>
          <TouchableOpacity style={{ padding: 20 }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
          </TouchableOpacity>
        </Link>
      )}
    />
  );
}
