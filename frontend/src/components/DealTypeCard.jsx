import {
  Card,
  CardBody,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button
} from '@chakra-ui/react';

const DealTypeCard = ({
  title,
  description,
  icon,
  onClick,
  isLoading = false
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: 'brand.accentPrimary'
      }}
      onClick={onClick}
      minH="200px"
      maxW="320px"
    >
      <CardBody>
        <VStack spacing={4} align="center" textAlign="center" h="full">
          <Icon
            as={icon}
            color="brand.accentPrimary"
            boxSize={8}
          />
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary">
              {title}
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.5">
              {description}
            </Text>
          </VStack>
          <Button
            bg="brand.accentPrimary"
            color="white"
            size="sm"
            isLoading={isLoading}
            _hover={{ bg: '#c8aeb0' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Get Started
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default DealTypeCard;