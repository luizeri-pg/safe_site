using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SafeSite.Api.DTOs;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/solicitacoes")]
[Authorize(Roles = "admin")]
public class SolicitacoesController : ControllerBase
{
    private readonly ISolicitacoesService _service;

    public SolicitacoesController(ISolicitacoesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<SolicitacoesListResponse>> Listar(
        [FromQuery] string? tipo,
        [FromQuery] string? status,
        [FromQuery] string? busca,
        CancellationToken ct)
    {
        var dados = await _service.ListarTodasAsync(tipo, status, busca, ct);
        return Ok(new SolicitacoesListResponse { Sucesso = true, Dados = dados });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<SolicitacaoDto>> Atualizar(int id, [FromBody] AtualizarSolicitacaoRequest request, CancellationToken ct)
    {
        var atualizado = await _service.AtualizarAsync(id, request, ct);
        if (atualizado == null)
            return NotFound();
        return Ok(atualizado);
    }
}
