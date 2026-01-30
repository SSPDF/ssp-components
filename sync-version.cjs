#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const libPackagePath = path.join(__dirname, 'lib-package.json')
const packagePath = path.join(__dirname, 'package.json')

try {
    // Lê ambos os arquivos
    const libPackage = JSON.parse(fs.readFileSync(libPackagePath, 'utf8'))
    const mainPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    // Verifica se as versões são diferentes
    if (libPackage.version !== mainPackage.version) {
        console.log(`📦 Sincronizando versão: ${mainPackage.version} → ${libPackage.version}`)

        // Atualiza a versão do package.json
        mainPackage.version = libPackage.version

        // Salva o package.json atualizado
        fs.writeFileSync(packagePath, JSON.stringify(mainPackage, null, 4) + '\n', 'utf8')

        console.log('✅ Versão sincronizada com sucesso!')
    } else {
        console.log('✓ Versões já estão sincronizadas:', libPackage.version)
    }
} catch (error) {
    console.error('❌ Erro ao sincronizar versões:', error.message)
    process.exit(1)
}
