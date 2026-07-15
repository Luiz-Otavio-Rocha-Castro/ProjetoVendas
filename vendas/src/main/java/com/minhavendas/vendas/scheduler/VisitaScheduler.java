package com.minhavendas.vendas.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.minhavendas.vendas.model.Notificacao;
import com.minhavendas.vendas.model.Visita;
import com.minhavendas.vendas.repository.NotificacaoRepository;
import com.minhavendas.vendas.repository.VisitaRepository;

@Component
public class VisitaScheduler {

    private static final Logger logger = LoggerFactory.getLogger(VisitaScheduler.class);

    @Autowired
    private VisitaRepository visitaRepository;

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    // Roda a cada 5 minutos (300.000 ms)
    @Scheduled(fixedRate = 300000)
    public void verificarVisitasProximas() {
        logger.info("[SCHEDULER] Verificando visitas agendadas que precisam de alerta...");

        List<Visita> agendadas = visitaRepository.buscarPendentesDeAlerta("Agendada");
        LocalDateTime agora = LocalDateTime.now();

        for (Visita v : agendadas) {
            if (v.getDataVisita() != null && v.getHoraVisita() != null) {
                LocalDateTime dataHoraVisita = LocalDateTime.of(v.getDataVisita(), v.getHoraVisita());
                
                // Se a visita for no futuro e estiver a menos de ou igual a 3 horas de distância
                if (dataHoraVisita.isAfter(agora) && dataHoraVisita.minusHours(3).isBefore(agora) || dataHoraVisita.minusHours(3).equals(agora)) {
                    enviarAlertaSimulado(v);
                    
                    // Salvar notificação no banco de dados para o sino do app
                    Notificacao notif = new Notificacao();
                    notif.setTitulo("Visita em Breve: " + v.getNomeProspecto());
                    notif.setMensagem("Lembre-se que você tem uma visita agendada para as " + v.getHoraVisita() + " em " + v.getEndereco() + " hoje.");
                    notif.setVendedorId(v.getVendedorId());
                    notificacaoRepository.save(notif);

                    v.setAlertaEnviado(true);
                    visitaRepository.save(v);
                }
            }
        }
    }

    private void enviarAlertaSimulado(Visita v) {
        logger.info("=====================================================");
        logger.info("📧 [SIMULAÇÃO DE E-MAIL] ALERTA DE VISITA PRÓXIMA");
        logger.info("Para: lucas@solariguatu.com.br (Vendedor)");
        logger.info("Assunto: Lembrete: Visita com {} em breve!", v.getNomeProspecto());
        logger.info("Mensagem:");
        logger.info("Olá,");
        logger.info("Lembre-se que você tem uma visita agendada para as {} em {} hoje.", v.getHoraVisita(), v.getEndereco());
        logger.info("=====================================================");
    }
}
