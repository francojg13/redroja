'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailBienvenida(
  email: string,
  nombre: string,
  apellido: string
) {
  try {
    // Solo enviar a email registrado en Resend durante desarrollo
    const emailDestino = 'francojg13@outlook.com'
    
    console.log(`Intentando enviar email de bienvenida a ${emailDestino} (usuario: ${email})`)
    
    const result = await resend.emails.send({
      from: 'Red Roja <onboarding@resend.dev>',
      to: emailDestino,
      subject: '¡Bienvenido a Red Roja! 🩸',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">¡Bienvenido a Red Roja, ${nombre}!</h1>
          
          ${email !== emailDestino ? `<p style="color: #666; font-size: 12px;"><em>Nota: Este email se envía a ${emailDestino} porque Resend requiere verificación de dominio.</em></p>` : ''}
          
          <p>Hola ${nombre} ${apellido},</p>
          
          <p>Gracias por unirte a Red Roja, el sistema de donación de sangre de Tucumán.</p>
          
          <h3>Próximos pasos:</h3>
          <ul>
            <li>✅ Completa tu perfil médico</li>
            <li>✅ Sube tu certificado médico actualizado</li>
            <li>✅ Explora las solicitudes activas</li>
            <li>✅ Programa tu primera donación</li>
          </ul>
          
          <p>Con cada donación puedes salvar hasta 3 vidas. ¡Gracias por hacer la diferencia!</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #fef2f2; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>¿Necesitas ayuda?</strong></p>
            <p style="margin: 5px 0 0 0;">Visita tu dashboard en: <a href="https://redroja.vercel.app">redroja.vercel.app</a></p>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Este es un email automático del Sistema Red Roja - Tucumán, Argentina
          </p>
        </div>
      `
    })

    console.log('Email enviado exitosamente:', result)
    return { success: true }
    
  } catch (error) {
    console.error('Error en enviarEmailBienvenida:', error)
    // No retornar el objeto error completo, solo el mensaje
    return { success: false, message: 'Error al enviar email' }
  }
}

/**
 * Server Action: Email cuando se crea una solicitud urgente
 */
export async function enviarEmailSolicitudUrgente(
  solicitud: {
    tipo_sangre: string
    unidades: number
    hospital: string
    ciudad: string
  },
  donantesEmails: string[]
) {
  try {
    // Durante desarrollo, solo enviar a email verificado
    const emailsDestino = ['francojg13@outlook.com']
    
    const { data, error } = await resend.emails.send({
      from: 'Red Roja Alertas <onboarding@resend.dev>',
      to: emailsDestino,
      subject: `🚨 URGENTE: Se necesita sangre tipo ${solicitud.tipo_sangre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🚨 SOLICITUD URGENTE</h1>
          </div>
          
          <div style="padding: 20px;">
            <p style="color: #666; font-size: 12px;"><em>Nota: En producción este email se enviaría a ${donantesEmails.length} donantes compatibles.</em></p>
            
            <h2>Se necesita sangre tipo ${solicitud.tipo_sangre}</h2>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Tipo de sangre:</strong> ${solicitud.tipo_sangre}</p>
              <p style="margin: 5px 0;"><strong>Unidades necesarias:</strong> ${solicitud.unidades}</p>
              <p style="margin: 5px 0;"><strong>Hospital:</strong> ${solicitud.hospital}</p>
              <p style="margin: 5px 0;"><strong>Ciudad:</strong> ${solicitud.ciudad}</p>
            </div>
            
            <p><strong>Tu ayuda puede salvar una vida hoy.</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://redroja.vercel.app/app-protected/solicitudes" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Solicitud Completa
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Recibes este email porque tu tipo de sangre es compatible y estás registrado como donante en Red Roja.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Error enviando email de solicitud urgente:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de solicitud urgente enviado:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error enviando email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Server Action: Email de confirmación de donación programada
 */
export async function enviarEmailConfirmacionDonacion(
  email: string,
  nombre: string,
  donacion: {
    fecha: string
    banco: string
    direccion: string
    tipo_sangre: string
  }
) {
  try {
    // Solo enviar a email registrado en Resend durante desarrollo
    const emailDestino = email === 'francojg13@outlook.com' ? email : 'francojg13@outlook.com'
    
    const { data, error } = await resend.emails.send({
      from: 'Red Roja <onboarding@resend.dev>',
      to: emailDestino,
      subject: '✅ Donación Programada Confirmada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">¡Donación Confirmada! ✅</h1>
          
          ${email !== emailDestino ? `<p style="color: #666; font-size: 12px;"><em>Nota: Este email está siendo enviado a ${emailDestino} porque Resend requiere verificación de dominio.</em></p>` : ''}
          
          <p>Hola ${nombre},</p>
          
          <p>Tu donación de sangre ha sido programada exitosamente.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0;">Detalles de tu donación:</h3>
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${donacion.fecha}</p>
            <p style="margin: 5px 0;"><strong>🏥 Banco de Sangre:</strong> ${donacion.banco}</p>
            <p style="margin: 5px 0;"><strong>📍 Dirección:</strong> ${donacion.direccion}</p>
            <p style="margin: 5px 0;"><strong>🩸 Tipo de sangre:</strong> ${donacion.tipo_sangre}</p>
          </div>
          
          <h3>Recomendaciones antes de donar:</h3>
          <ul>
            <li>Descansa bien la noche anterior</li>
            <li>Desayuna o almuerza normalmente</li>
            <li>Bebe mucha agua</li>
            <li>Lleva tu DNI y certificado médico</li>
            <li>Evita hacer ejercicio intenso 24hs antes</li>
          </ul>
          
          <p><strong>¡Gracias por salvar vidas! 🩸❤️</strong></p>
          
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Si necesitas cancelar o reprogramar, ingresa a tu perfil en Red Roja.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Error enviando email de confirmación:', error)
      return { success: false, error: error.message }
    }

    console.log('Email de confirmación enviado:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error enviando email:', error)
    return { success: false, error: error.message }
  }
}