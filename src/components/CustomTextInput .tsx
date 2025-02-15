import { Text, TextInput, View } from "react-native";

import { TextInputProps } from "react-native";

interface CustomTextInputProps extends TextInputProps {
  label: string;
}

export default function CustomTextInput({
  label,
  ...textInputProps
}: CustomTextInputProps) {
  return (
    <View>
      <Text className="mb-2 text-gray-500 font-semibold">{label}</Text>
      <TextInput
        {...textInputProps}
        className="border border-gray-300 p-3 rounded-md"
      />
    </View>
  );
}
