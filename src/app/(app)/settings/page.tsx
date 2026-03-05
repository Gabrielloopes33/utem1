import { PageHeader } from "../../../components/shared/page-header"
import { Card, CardContent } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"

export default function SettingsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Configurações"
        description="API keys e preferências da organização"
      />

      <div className="space-y-6 max-w-2xl">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-display text-base font-semibold">API Keys</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Anthropic API Key</Label>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input type="password" placeholder="sk-..." disabled />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Em construção — API keys serão configuradas via .env.local por enquanto
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
