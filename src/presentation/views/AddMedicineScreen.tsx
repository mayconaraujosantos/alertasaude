import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal as RNModal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModal } from '../../hooks/useModal';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import ImagePickerModal from '../components/ImagePickerModal';
import ActionsMenuModal from '../components/ActionsMenuModal';
import { DIContainer } from '../../infrastructure/di/DIContainer';

interface AddMedicineScreenProps {
  readonly navigation: any;
}

export default function AddMedicineScreen({
  navigation,
}: AddMedicineScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');
  // Novos campos para dosagem estruturada
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('mg');
  const [forma, setForma] = useState('comprimido');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showFormaModal, setShowFormaModal] = useState(false); // Formas farmacêuticas disponíveis
  const formas = [
    { label: 'Comprimido', value: 'comprimido' },
    { label: 'Cápsula', value: 'capsula' },
    { label: 'Líquido', value: 'liquido' },
    { label: 'Xarope', value: 'xarope' },
    { label: 'Pomada', value: 'pomada' },
    { label: 'Creme', value: 'creme' },
    { label: 'Injetável', value: 'injetavel' },
    { label: 'Spray', value: 'spray' },
    { label: 'Supositório', value: 'supositorio' },
    { label: 'Adesivo', value: 'adesivo' },
  ];

  // Função para sugerir unidades baseadas na forma selecionada
  const getUnidadesSugeridas = (formaSelecionada: string) => {
    const sugestoes: { [key: string]: string[] } = {
      liquido: ['ml', 'gotas', 'colheres'],
      xarope: ['ml', 'colheres'],
      comprimido: ['mg', 'mcg', 'ui'],
      capsula: ['mg', 'mcg', 'ui'],
      pomada: ['g', 'mg', '%'],
      creme: ['g', 'mg', '%'],
      injetavel: ['ml', 'mg', 'ui'],
      spray: ['borrifadas', 'ml'],
      supositorio: ['mg', 'g'],
      adesivo: ['mg', 'mcg'],
    };
    return sugestoes[formaSelecionada] || ['mg', 'ml', 'g'];
  };
  const { Modal, showError, showSuccess } = useModal();
  const { colors, styles } = useSystemTheme();

  // Dependency Injection
  const diContainer = DIContainer.getInstance();
  const createMedicineUseCase = diContainer.createMedicineUseCase;

  // Calculate form completion progress
  const getFormProgress = () => {
    let progress = 0;
    const fields = [
      { value: name.trim(), weight: 40 }, // Name is more important
      { value: quantidade.trim(), weight: 30 }, // Quantidade is required
      { value: unidade, weight: 10 }, // Unidade is required
      { value: description.trim(), weight: 10 }, // Description is optional
      { value: imageUri, weight: 10 }, // Image is optional
    ];
    fields.forEach(field => {
      if (field.value) progress += field.weight;
    });

    return Math.min(progress, 100);
  };

  const progress = getFormProgress();
  const isFormValid = name.trim() && quantidade.trim();

  // Atualizar dosage combinando quantidade, unidade e forma
  useEffect(() => {
    if (quantidade.trim()) {
      const formaLabel = formas.find(f => f.value === forma)?.label || forma;
      setDosage(`${quantidade} ${unidade} (${formaLabel})`);
    } else {
      setDosage('');
    }
  }, [quantidade, unidade, forma, formas]);
  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      let result;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showError(
            'Permissão Negada',
            'É necessário permitir acesso à câmera.',
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showError(
            'Permissão Negada',
            'É necessário permitir acesso à galeria.',
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setImagePickerVisible(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleSave = async () => {
    console.log('🔵 [AddMedicineScreen] Iniciando salvamento de medicamento');
    console.log('🔵 [AddMedicineScreen] Dados do formulário:', {
      name: name.trim(),
      dosage: dosage.trim(),
      description: description.trim(),
      imageUri,
      quantidade: quantidade.trim(),
      unidade,
      forma,
      isFormValid,
      progress,
    });

    if (!isFormValid) {
      const error = 'Preencha pelo menos o nome e a dosagem do medicamento.';
      console.error('🔴 [AddMedicineScreen] Validação falhou:', error);
      showError('Dados Incompletos', error);
      return;
    }

    console.log(
      '🟢 [AddMedicineScreen] Validação passou, iniciando salvamento',
    );
    setLoading(true);

    try {
      const medicineData = {
        name: name.trim(),
        dosage: dosage.trim(),
        description: description.trim() || undefined,
        imageUri: imageUri || undefined,
        quantidade: quantidade.trim() || undefined,
        unidade: unidade || undefined,
        forma: forma || undefined,
      };

      console.log(
        '🔵 [AddMedicineScreen] Chamando createMedicineUseCase.execute com:',
        medicineData,
      );

      await createMedicineUseCase.execute(
        medicineData.name,
        medicineData.dosage,
        medicineData.description,
        medicineData.imageUri,
        medicineData.quantidade,
        medicineData.unidade,
        medicineData.forma,
      );

      console.log('🟢 [AddMedicineScreen] Medicamento salvo com sucesso');

      showSuccess(
        'Medicamento Adicionado',
        `${name} foi adicionado com sucesso!`,
        () => {
          navigation.goBack();
        },
      );
    } catch (error) {
      console.error(
        '🔴 [AddMedicineScreen] Erro ao salvar medicamento:',
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔴 [AddMedicineScreen] Mensagem de erro:', errorMessage);
      showError('Erro ao Salvar', errorMessage);
    } finally {
      setLoading(false);
      console.log('🔵 [AddMedicineScreen] Finalizando processo de salvamento');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDosage('');
    setImageUri(null);
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.container]} edges={['top']}>
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, marginLeft: -8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text.primary,
            }}
          >
            Novo Medicamento
          </Text>

          <TouchableOpacity
            onPress={() => setShowActionsMenu(true)}
            style={{ padding: 8, marginRight: -8 }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.text.secondary,
              }}
            >
              Progresso do preenchimento
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.primary,
              }}
            >
              {progress}%
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              height: 8,
              backgroundColor: colors.border,
              borderRadius: 4,
            }}
          >
            <View
              style={{
                height: 8,
                backgroundColor: colors.primary,
                borderRadius: 4,
                width: `${progress}%`,
              }}
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View className="px-4 mb-6">
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: 12,
              }}
            >
              Foto do Medicamento
            </Text>

            {imageUri ? (
              /* Preview da Imagem Selecionada */
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    position: 'relative',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                    }}
                    resizeMode="cover"
                  />

                  {/* Botão de Remover */}
                  <TouchableOpacity
                    onPress={removeImage}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: colors.error,
                      borderRadius: 20,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>

                  {/* Botão de Trocar Imagem */}
                  <TouchableOpacity
                    onPress={() => setImagePickerVisible(true)}
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      backgroundColor: colors.primary,
                      borderRadius: 20,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Ionicons name="camera" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Informações da Imagem */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: 14,
                      marginLeft: 6,
                      textAlign: 'center',
                    }}
                  >
                    Imagem selecionada
                  </Text>
                </View>

                {/* Botões de Ação */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 12,
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setImagePickerVisible(true)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={16}
                      color={colors.text.secondary}
                    />
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: 14,
                        marginLeft: 4,
                      }}
                    >
                      Trocar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={removeImage}
                    style={{
                      flex: 1,
                      backgroundColor: colors.error + '15',
                      borderWidth: 1,
                      borderColor: colors.error + '30',
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.error}
                    />
                    <Text
                      style={{
                        color: colors.error,
                        fontSize: 14,
                        marginLeft: 4,
                      }}
                    >
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Estado Vazio - Adicionar Imagem */
              <TouchableOpacity
                onPress={() => setImagePickerVisible(true)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 24,
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  minHeight: 150,
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.primary + '15',
                    borderRadius: 50,
                    width: 80,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 4,
                    textAlign: 'center',
                  }}
                >
                  Adicionar Foto
                </Text>

                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}
                >
                  Toque para capturar ou selecionar{'\n'}uma imagem do
                  medicamento
                </Text>

                <Text
                  style={{
                    color: colors.text.muted,
                    fontSize: 12,
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  (Opcional)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View className="px-4 space-y-6">
            {/* Medicine Name */}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Nome do Medicamento *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Dipirona, Paracetamol..."
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  fontSize: 16,
                }}
                placeholderTextColor={colors.text.muted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Dosage - New Structured Field */}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Dosagem *
              </Text>

              {/* Row with Quantidade, Unidade and Forma */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {/* Quantidade Input */}
                <View style={{ flex: 2 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                      marginBottom: 4,
                    }}
                  >
                    Quantidade
                  </Text>
                  <TextInput
                    value={quantidade}
                    onChangeText={setQuantidade}
                    placeholder="Ex: 500"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: colors.text.primary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      fontSize: 16,
                    }}
                    placeholderTextColor={colors.text.muted}
                  />
                </View>

                {/* Unidade Selector */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                      marginBottom: 4,
                    }}
                  >
                    Unidade
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowUnidadeModal(true)}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: colors.text.primary, fontSize: 16 }}>
                      {unidade}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.text.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forma Farmacêutica */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.secondary,
                    marginBottom: 4,
                  }}
                >
                  Forma Farmacêutica
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFormaModal(true)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: colors.text.primary, fontSize: 16 }}>
                    {formas.find(f => f.value === forma)?.label || 'Selecionar'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Preview da Dosagem */}
              {quantidade.trim() && (
                <View
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                    Dosagem completa:
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text.primary,
                      fontWeight: '600',
                    }}
                  >
                    {quantidade} {unidade} (
                    {formas.find(f => f.value === forma)?.label})
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginBottom: 12,
                }}
              >
                Observações
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Informações adicionais sobre o medicamento..."
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border,
                  fontSize: 16,
                  minHeight: 80,
                }}
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isFormValid || loading}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                isFormValid && !loading ? colors.primary : colors.border,
            }}
          >
            {loading ? (
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Salvando...
              </Text>
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={isFormValid ? 'white' : colors.text.muted}
                />
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: 8,
                    color: isFormValid ? 'white' : colors.text.muted,
                  }}
                >
                  Salvar Medicamento
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onCamera={() => handleImagePicker('camera')}
        onGallery={() => handleImagePicker('gallery')}
      />

      {/* Actions Menu Modal */}
      <ActionsMenuModal
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        actions={[
          {
            icon: 'refresh-outline',
            title: 'Limpar Formulário',
            onPress: () => {
              resetForm();
              setShowActionsMenu(false);
            },
          },
        ]}
      />

      {/* Modal de Seleção de Unidade */}
      <RNModal visible={showUnidadeModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 20,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                }}
              >
                Selecionar Unidade
              </Text>
              <TouchableOpacity onPress={() => setShowUnidadeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {getUnidadesSugeridas(forma).map(unidadeOption => (
                <TouchableOpacity
                  key={unidadeOption}
                  onPress={() => {
                    setUnidade(unidadeOption);
                    setShowUnidadeModal(false);
                  }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor:
                      unidade === unidadeOption
                        ? colors.primary + '20'
                        : 'transparent',
                    borderWidth: unidade === unidadeOption ? 1 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        unidade === unidadeOption
                          ? colors.primary
                          : colors.text.primary,
                      fontWeight: unidade === unidadeOption ? '600' : '400',
                    }}
                  >
                    {unidadeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </RNModal>

      {/* Modal de Seleção de Forma Farmacêutica */}
      <RNModal visible={showFormaModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 20,
              maxHeight: '70%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text.primary,
                }}
              >
                Forma Farmacêutica
              </Text>
              <TouchableOpacity onPress={() => setShowFormaModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {formas.map(formaOption => (
                <TouchableOpacity
                  key={formaOption.value}
                  onPress={() => {
                    setForma(formaOption.value);
                    // Atualiza unidade sugerida automaticamente
                    const novasUnidades = getUnidadesSugeridas(
                      formaOption.value,
                    );
                    if (!novasUnidades.includes(unidade)) {
                      setUnidade(novasUnidades[0]);
                    }
                    setShowFormaModal(false);
                  }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor:
                      forma === formaOption.value
                        ? colors.primary + '20'
                        : 'transparent',
                    borderWidth: forma === formaOption.value ? 1 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        forma === formaOption.value
                          ? colors.primary
                          : colors.text.primary,
                      fontWeight: forma === formaOption.value ? '600' : '400',
                    }}
                  >
                    {formaOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </RNModal>

      <Modal />
    </SafeAreaView>
  );
}
