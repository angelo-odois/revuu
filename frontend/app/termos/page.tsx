import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso - Revuu",
  description: "Termos e condições de uso da plataforma Revuu para criação de portfólios profissionais.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/revuuLogo.png"
              alt="Revuu"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/admin"
            className="text-sm px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
          >
            Acessar Conta
          </Link>
        </nav>
      </header>

      {/* Content */}
      <article className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: Janeiro de 2025
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground mb-4">
                Ao acessar e usar o Revuu, você concorda com estes Termos de Uso
                e nossa Política de Privacidade. Se você não concordar com
                qualquer parte destes termos, não use nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground mb-4">
                O Revuu é uma plataforma de criação de portfólios profissionais
                online. Oferecemos ferramentas para criar, personalizar e
                publicar portfólios na internet.
              </p>
              <p className="text-muted-foreground mb-4">
                Nossos serviços incluem:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Editor visual de páginas</li>
                <li>Templates profissionais</li>
                <li>Hospedagem de portfólios</li>
                <li>Subdomínio gratuito (revuu.com.br/seu-nome)</li>
                <li>Domínio personalizado (planos pagos)</li>
                <li>Analytics e métricas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Cadastro e Conta</h2>
              <p className="text-muted-foreground mb-4">
                Para usar o Revuu, você deve criar uma conta fornecendo
                informações verdadeiras e mantendo-as atualizadas. Você é
                responsável por manter a segurança de sua conta e senha.
              </p>
              <p className="text-muted-foreground mb-4">
                Você concorda em:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Fornecer informações precisas no cadastro</li>
                <li>Manter sua senha em segurança</li>
                <li>Notificar-nos imediatamente sobre uso não autorizado</li>
                <li>Não compartilhar sua conta com terceiros</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Uso Aceitável</h2>
              <p className="text-muted-foreground mb-4">
                Você concorda em usar o Revuu apenas para fins legais e de acordo
                com estes termos. É proibido:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Publicar conteúdo ilegal, difamatório ou ofensivo</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
                <li>Distribuir malware ou código malicioso</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Usar o serviço para spam ou phishing</li>
                <li>Revender o serviço sem autorização</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Conteúdo do Usuário</h2>
              <p className="text-muted-foreground mb-4">
                Você mantém todos os direitos sobre o conteúdo que publica no
                Revuu. Ao publicar conteúdo, você nos concede uma licença mundial,
                não exclusiva, para hospedar, exibir e distribuir seu conteúdo
                conforme necessário para fornecer o serviço.
              </p>
              <p className="text-muted-foreground mb-4">
                Você é responsável por todo o conteúdo que publica e garante que
                tem os direitos necessários para publicá-lo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Planos e Pagamentos</h2>
              <p className="text-muted-foreground mb-4">
                Oferecemos planos gratuitos e pagos. Os planos pagos são cobrados
                mensalmente ou anualmente, conforme escolhido no momento da
                assinatura.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
                <li>A cobrança é feita automaticamente no início de cada período</li>
                <li>Não há reembolso proporcional por cancelamento antecipado</li>
                <li>O downgrade para plano gratuito pode resultar em perda de recursos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Cancelamento</h2>
              <p className="text-muted-foreground mb-4">
                Você pode cancelar sua conta a qualquer momento. Após o
                cancelamento:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Seu portfólio será desativado imediatamente</li>
                <li>Seus dados serão retidos por 30 dias para possível restauração</li>
                <li>Após 30 dias, seus dados serão permanentemente excluídos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground mb-4">
                O Revuu é fornecido &quot;como está&quot;, sem garantias de qualquer tipo.
                Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Interrupções temporárias do serviço</li>
                <li>Perda de dados devido a falhas técnicas</li>
                <li>Danos indiretos decorrentes do uso do serviço</li>
                <li>Conteúdo publicado por usuários</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground mb-4">
                Podemos atualizar estes termos periodicamente. Notificaremos sobre
                mudanças significativas por email ou através do serviço. O uso
                continuado após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contato</h2>
              <p className="text-muted-foreground mb-4">
                Para dúvidas sobre estes termos, entre em contato:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>Email: legal@revuu.com.br</li>
                <li>
                  <Link href="/contato" className="text-amber-500 hover:underline">
                    Formulário de contato
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Revuu. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link href="/ajuda" className="hover:text-foreground">Ajuda</Link>
            <Link href="/contato" className="hover:text-foreground">Contato</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
