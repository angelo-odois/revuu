import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade - Revuu",
  description: "Política de privacidade da plataforma Revuu. Saiba como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground mb-8">
            Última atualização: Janeiro de 2025
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground mb-4">
                A Revuu (&quot;nós&quot;, &quot;nosso&quot;) está comprometida em proteger sua
                privacidade. Esta política explica como coletamos, usamos e
                protegemos suas informações pessoais quando você usa nossa
                plataforma.
              </p>
              <p className="text-muted-foreground mb-4">
                Esta política está em conformidade com a Lei Geral de Proteção de
                Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Dados que Coletamos</h2>
              <p className="text-muted-foreground mb-4">
                Coletamos os seguintes tipos de dados:
              </p>

              <h3 className="text-xl font-semibold mb-3">2.1 Dados fornecidos por você</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Informações de perfil (título profissional, bio, foto)</li>
                <li>Conteúdo do portfólio (projetos, experiências, educação)</li>
                <li>Informações de pagamento (processadas por terceiros)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Dados coletados automaticamente</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Endereço IP</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Páginas visitadas e tempo de uso</li>
                <li>Dados de analytics do portfólio</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Como Usamos seus Dados</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Fornecer e manter nosso serviço</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Personalizar sua experiência</li>
                <li>Fornecer estatísticas de visitas ao seu portfólio</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-4">
                Não vendemos seus dados pessoais. Podemos compartilhar dados com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Processadores de pagamento:</strong> Stripe ou similar,
                  para processar transações
                </li>
                <li>
                  <strong>Provedores de hospedagem:</strong> Para armazenar e
                  servir seu portfólio
                </li>
                <li>
                  <strong>Serviços de analytics:</strong> Para entender o uso da
                  plataforma
                </li>
                <li>
                  <strong>Autoridades legais:</strong> Quando exigido por lei
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-4">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Confirmação e acesso:</strong> Saber se tratamos seus
                  dados e acessá-los
                </li>
                <li>
                  <strong>Correção:</strong> Corrigir dados incompletos ou
                  desatualizados
                </li>
                <li>
                  <strong>Anonimização ou exclusão:</strong> Solicitar
                  anonimização ou exclusão de dados
                </li>
                <li>
                  <strong>Portabilidade:</strong> Receber seus dados em formato
                  estruturado
                </li>
                <li>
                  <strong>Revogação do consentimento:</strong> Revogar
                  consentimento a qualquer momento
                </li>
                <li>
                  <strong>Informação:</strong> Saber com quem compartilhamos seus
                  dados
                </li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Para exercer esses direitos, entre em contato através de{" "}
                <Link href="/contato" className="text-amber-500 hover:underline">
                  nosso formulário
                </Link>{" "}
                ou email privacidade@revuu.com.br.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Cookies essenciais:</strong> Necessários para o
                  funcionamento do site
                </li>
                <li>
                  <strong>Cookies de preferências:</strong> Lembrar suas
                  configurações
                </li>
                <li>
                  <strong>Cookies de analytics:</strong> Entender como você usa
                  nosso serviço
                </li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Você pode gerenciar cookies nas configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Segurança</h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de segurança para proteger seus dados:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Criptografia SSL/TLS em todas as comunicações</li>
                <li>Senhas armazenadas com hash seguro (bcrypt)</li>
                <li>Backups regulares com criptografia</li>
                <li>Acesso restrito a dados por funcionários autorizados</li>
                <li>Monitoramento de segurança contínuo</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Retenção de Dados</h2>
              <p className="text-muted-foreground mb-4">
                Mantemos seus dados enquanto sua conta estiver ativa. Após o
                cancelamento:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Dados da conta: excluídos após 30 dias</li>
                <li>Dados de pagamento: mantidos conforme exigido por lei</li>
                <li>Logs de acesso: mantidos por 6 meses</li>
                <li>Backups: excluídos após 90 dias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Menores de Idade</h2>
              <p className="text-muted-foreground mb-4">
                O Revuu não é destinado a menores de 18 anos. Não coletamos
                intencionalmente dados de menores. Se você é menor de idade, não
                use nosso serviço sem autorização de um responsável.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground mb-4">
                Podemos atualizar esta política periodicamente. Notificaremos
                sobre mudanças significativas por email. A data de &quot;última
                atualização&quot; no topo indica quando a política foi modificada pela
                última vez.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Contato</h2>
              <p className="text-muted-foreground mb-4">
                Para questões sobre privacidade:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>Email: privacidade@revuu.com.br</li>
                <li>
                  <Link href="/contato" className="text-amber-500 hover:underline">
                    Formulário de contato
                  </Link>
                </li>
              </ul>
            </section>

            <section className="p-6 bg-muted/30 rounded-xl">
              <h2 className="text-xl font-bold mb-2">Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground">
                Nosso Encarregado de Proteção de Dados pode ser contatado através
                do email: dpo@revuu.com.br
              </p>
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
            <Link href="/termos" className="hover:text-foreground">Termos</Link>
            <Link href="/ajuda" className="hover:text-foreground">Ajuda</Link>
            <Link href="/contato" className="hover:text-foreground">Contato</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
