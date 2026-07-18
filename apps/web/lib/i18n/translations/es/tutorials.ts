export const tutorials = {
	badge: 'Centro de Ayuda',
	title: 'Tutoriales y',
	titleHighlight: 'Guías',
	subtitle:
		'Guías paso a paso para ayudarte a sacar el máximo provecho de KindFi — desde crear tu cuenta hasta gestionar campañas y entender cómo se liberan los fondos.',
	sections: {
		gettingStarted: 'Primeros Pasos',
		campaigns: 'Campañas',
		donations: 'Donaciones y Hitos',
	},
	cards: {
		register: {
			title: 'Regístrate y Crea una Cuenta',
			description: 'Configura tu cuenta en KindFi y prepárate para apoyar o lanzar campañas.',
			steps: [
				'Ve a kindfi.org y haz clic en Registrarse.',
				'Ingresa tu correo electrónico y crea una contraseña segura.',
				'Verifica tu correo usando el enlace enviado a tu bandeja de entrada.',
				'Completa el registro con passkey para mayor seguridad.',
				'Completa tu perfil (nombre, bio, avatar).',
				'Tu cuenta está lista — explora proyectos o inicia una campaña.',
			],
		},
		createCampaign: {
			title: 'Crear una Campaña',
			description: 'Lanza una campaña de crowdfunding basada en hitos en la blockchain de Stellar.',
			steps: [
				'Inicia sesión y navega a Crear Campaña desde el encabezado.',
				'Elige una categoría y completa el título y descripción de tu campaña.',
				'Establece tu meta de financiamiento y fecha límite.',
				'Define al menos un hito con un entregable claro y monto asignado.',
				'Sube una imagen de portada y contenido multimedia de apoyo.',
				'Envía tu campaña para revisión asistida por IA.',
				'Una vez aprobada, tu campaña se publica y es visible para los colaboradores.',
			],
		},
		milestones: {
			title: 'Completar y Enviar Hitos',
			description:
				'Proporciona evidencia de tu progreso para desbloquear el siguiente tramo de fondos.',
			steps: [
				'Abre el panel de tu campaña y selecciona el hito activo.',
				'Haz clic en Enviar Evidencia y sube pruebas de cumplimiento (documentos, fotos, enlaces).',
				'Agrega una actualización escrita describiendo lo que se logró.',
				'Envía el hito para revisión.',
				'El equipo de KindFi o los validadores de la comunidad verificarán tu envío.',
				'Una vez aprobado, los fondos del hito se liberan a tu billetera.',
			],
		},
		readyForReview: {
			title: 'Marcar Proyecto como Listo para Revisión',
			description: 'Indica que tu proyecto está completo y listo para evaluación final.',
			steps: [
				'Asegúrate de que todos los hitos hayan sido enviados y verificados.',
				'Abre el panel de tu campaña y haz clic en Marcar como Listo para Revisión.',
				'Agrega una actualización final de resumen para tus patrocinadores.',
				'El equipo de la plataforma programará una revisión final.',
				'Una vez aprobado, el proyecto se marca como completo y se liberan los fondos restantes.',
			],
		},
		donationFlow: {
			title: 'Entender el Flujo de Donaciones e Hitos',
			description:
				'Aprende cómo se mueven los fondos del donante al creador de campaña mediante escrow sin confianza.',
			steps: [
				'Un donante encuentra una campaña y hace clic en Donar.',
				'Los fondos se transfieren a un contrato de escrow de Trustless Work en Stellar.',
				'El creador de la campaña completa un hito y envía evidencia.',
				'Los validadores revisan y aprueban el envío del hito.',
				'El monto aprobado se libera del escrow al creador de la campaña.',
				'Los donantes pueden rastrear cada paso on-chain desde el panel de campaña.',
				'Si se rechaza un hito, los fondos permanecen bloqueados hasta reenvío o reembolso.',
			],
		},
		createFoundation: {
			title: 'Crear una Fundación',
			description:
				'Crea una entidad organizacional para gestionar múltiples campañas bajo un mismo paraguas.',
			steps: [
				'Inicia sesión y navega a Crear Fundación desde el menú del encabezado.',
				'Proporciona el nombre, misión y categoría de tu fundación.',
				'Sube un logo y completa los datos de contacto.',
				'Envía para verificación — el equipo de KindFi revisará tu solicitud.',
				'Una vez verificada, puedes vincular campañas al perfil de tu fundación.',
				'Tu página de fundación se convierte en un hub para todas las iniciativas relacionadas.',
			],
		},
	},
	cta: {
		title: '¿Aún Tienes Preguntas?',
		subtitle:
			'Consulta nuestras Preguntas Frecuentes para respuestas rápidas o únete a la comunidad para soporte en tiempo real.',
		faqs: 'Ver FAQs',
		community: 'Unirse a la Comunidad',
	},
}
