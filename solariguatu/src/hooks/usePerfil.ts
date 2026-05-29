import { useState, useCallback } from 'react'

export interface PerfilVendedor {
  nome: string
  email: string
  regiao: string
  avatar: string
  metaReais: number
  metaKwp: number
  faturamentoAtual: number
  kwpAtual: number
  contratosAtual: number
}

const PERFIL_KEY = 'solariguatu_perfil'

const PERFIL_INICIAL: PerfilVendedor = {
  nome: 'Lucas Araújo',
  email: 'lucas@solariguatu.com.br',
  regiao: 'Vale do Jaguaribe – CE',
  avatar: 'LA',
  metaReais: 280000,
  metaKwp: 120,
  faturamentoAtual: 198400,
  kwpAtual: 82.4,
  contratosAtual: 9,
}

function loadPerfil(): PerfilVendedor {
  try {
    const raw = localStorage.getItem(PERFIL_KEY)
    if (raw) return { ...PERFIL_INICIAL, ...JSON.parse(raw) }
  } catch { /* noop */ }
  return PERFIL_INICIAL
}

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilVendedor>(loadPerfil)
  const [saving, setSaving] = useState(false)

  const updatePerfil = useCallback(
    (dados: Partial<PerfilVendedor>): Promise<void> => {
      return new Promise((resolve) => {
        setSaving(true)
        setTimeout(() => {
          const updated = { ...perfil, ...dados }
          setPerfil(updated)
          try { localStorage.setItem(PERFIL_KEY, JSON.stringify(updated)) } catch { /* noop */ }
          setSaving(false)
          resolve()
        }, 800)
      })
    },
    [perfil]
  )

  return { perfil, saving, updatePerfil }
}
